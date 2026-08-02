const axios = require('axios');
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

class BkashPaymentGateway {
  constructor() {
    this.baseURL = '';
    this.merchantId = '';
    this.merchantKey = '';
    this.merchantSecret = '';
    this.accessToken = '';
    this.tokenExpiry = null;
    this.isDemoMode = false;
    this.isLive = false;
  }

  async initialize() {
    try {
      // Get bKash settings from database
      const [settings] = await pool.execute(`
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE setting_key LIKE 'bkash_%'
      `);

      const bkashSettings = {};
      settings.forEach(setting => {
        bkashSettings[setting.setting_key] = setting.setting_value;
      });

      this.isLive = bkashSettings.bkash_is_live === 'true';
      this.baseURL = bkashSettings.bkash_api_url || (this.isLive ? 'https://tokenized.pay.bka.sh/v1.2.0-beta' : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta');
      this.merchantId = bkashSettings.bkash_merchant_id || '';
      this.merchantKey = bkashSettings.bkash_merchant_key || '';
      this.merchantSecret = bkashSettings.bkash_merchant_secret || '';
      this.username = bkashSettings.bkash_username || '';
      this.password = bkashSettings.bkash_password || '';

      // If credentials are empty or dummy (DEMO), fall back to simulation mode
      this.isDemoMode = !this.merchantKey || !this.merchantSecret || !this.username || 
                        (this.merchantKey && this.merchantKey.includes('DEMO')) || 
                        (this.merchantSecret && this.merchantSecret.includes('DEMO'));
      
      if (this.isDemoMode) {
        console.warn('bKash Payment Gateway initialized in Demo/Simulation mode (missing API credentials)');
      } else {
        console.log(`bKash Payment Gateway initialized successfully in ${this.isLive ? 'LIVE' : 'SANDBOX'} mode.`);
      }
    } catch (error) {
      console.error('Failed to initialize bKash gateway:', error);
      this.isDemoMode = true; // Safe fallback
    }
  }

  logTokenToFile(type, token) {
    try {
      const logFilePath = path.join(__dirname, '..', 'bkash_tokens.txt');
      const timestamp = new Date().toLocaleString();
      const tokenStr = typeof token === 'object' ? JSON.stringify(token, null, 2) : token;
      const logMessage = `[${timestamp}] [${type}] Token: ${tokenStr}\n`;
      fs.appendFileSync(logFilePath, logMessage, 'utf8');
    } catch (err) {
      console.error('Failed to log token to file:', err);
    }
  }

  async getAccessToken() {
    if (this.isDemoMode) {
      const demoToken = 'demo_token';
      this.logTokenToFile('DEMO', demoToken);
      return demoToken;
    }
    try {
      // Check if we have a valid cached token
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        console.log('bkash cash token '+ this.accessToken);
        this.logTokenToFile('CACHED', this.accessToken);
        return this.accessToken;
      }

      const response = await axios.post(`${this.baseURL}/tokenized/checkout/token/grant`, {
        app_key: this.merchantKey,
        app_secret: this.merchantSecret
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'username': this.username,       // Required by bKash sandbox
          'password': this.password,       // Required by bKash sandbox
          'X-APP-Key': this.merchantKey
        }
      });

      if (response.data && response.data.id_token) {
        this.accessToken = response.data.id_token;
        // Set token expiry (55 min to be safe before the 1hr limit)
        this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
        console.log('bKash access token obtained successfully');
        console.log('bkash new token '+ this.accessToken);
        this.logTokenToFile('NEW', this.accessToken);
        return this.accessToken;

      } else {
        throw new Error('Failed to get bKash access token: no id_token in response');
      }
    } catch (error) {
      console.error('bKash token grant error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPayment(amount, bookingId, customerInfo) {
    if (this.isDemoMode) {
      return this.createDemoPayment(amount, bookingId, customerInfo);
    }
    try {
      const token = await this.getAccessToken();

      const paymentData = {
        mode: '0011', // Payment mode
        payerReference: customerInfo.phone || 'N/A',
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bkash/callback`,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `BOOKING_${bookingId}_${Date.now()}`
      };

      const response = await axios.post(`${this.baseURL}/tokenized/checkout/create`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': this.merchantKey
        }
      });

      if (response.data && response.data.paymentID) {
        console.log('bKash payment created:', response.data.paymentID);
        return {
          success: true,
          paymentID: response.data.paymentID,
          bkashURL: response.data.bkashURL,
          transactionStatus: response.data.transactionStatus
        };
      } else {
        throw new Error(response.data?.errorMessage || 'Failed to create bKash payment');
      }
    } catch (error) {
      console.error('bKash payment creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message
      };
    }
  }

  async executePayment(paymentID) {
    if (this.isDemoMode || (paymentID && paymentID.startsWith('DEMO_'))) {
      return this.executeDemoPayment(paymentID);
    }
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(`${this.baseURL}/tokenized/checkout/execute`, { paymentID }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': this.merchantKey
        }
      });

      if (response.data.statusCode === '0000') {
        console.log('bKash payment executed:', response.data);
        return {
          success: true,
          transactionID: response.data.trxID,
          amount: response.data.amount,
          currency: response.data.currency,
          paymentID: response.data.paymentID,
          transactionStatus: response.data.transactionStatus,
          customerMsisdn: response.data.customerMsisdn
        };
      } else {

        throw new Error(response.data?.statusMessage || 'Failed to execute bKash payment');
      }
    } catch (error) {
      console.error('bKash payment execution error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message
      };
    }
  }

  async queryPayment(paymentID) {
    if (this.isDemoMode || (paymentID && paymentID.startsWith('DEMO_'))) {
      return {
        success: true,
        transactionID: `DEMO_TXN_${Date.now()}`,
        amount: '100.00',
        currency: 'BDT',
        paymentID: paymentID,
        transactionStatus: 'Completed',
        customerMsisdn: '01700000000',
        isDemo: true
      };
    }
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(`${this.baseURL}/tokenized/checkout/payment/status`, { paymentID }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': this.merchantKey
        }
      });

      if (response.data) {
        return {
          success: true,
          transactionID: response.data.trxID,
          amount: response.data.amount,
          currency: response.data.currency,
          paymentID: response.data.paymentID,
          transactionStatus: response.data.transactionStatus,
          customerMsisdn: response.data.customerMsisdn
        };
      } else {
        throw new Error(response.data?.errorMessage || 'Failed to query bKash payment');
      }
    } catch (error) {
      console.error('bKash payment query error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message
      };
    }
  }


  // Demo mode - simulate payment for testing
  async createDemoPayment(amount, bookingId, customerInfo) {
    console.log('Creating demo bKash payment...');

    // Simulate payment creation
    const demoPaymentID = `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Point to backend simulation endpoint so the full booking flow completes in demo mode
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const demoBkashURL = `${backendUrl}/api/bkash/simulate-demo?paymentID=${demoPaymentID}&bookingId=${bookingId}`;

    return {
      success: true,
      paymentID: demoPaymentID,
      bkashURL: demoBkashURL,
      transactionStatus: 'Initiated',
      isDemo: true
    };
  }

  async executeDemoPayment(paymentID) {
    console.log('Executing demo bKash payment...');

    // Simulate successful payment
    const demoTransactionID = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      transactionID: demoTransactionID,
      amount: '1000.00', // Demo amount
      currency: 'BDT',
      paymentID: paymentID,
      transactionStatus: 'Completed',
      customerMsisdn: '01700000000',
      isDemo: true
    };
  }

  // --------------------------------------------------------
  // REFUND a previously executed payment to the customer
  // bKash endpoint: POST /tokenized/checkout/payment/refund
  // --------------------------------------------------------
  async refundPayment(paymentID, amount, trxID, reason) {
    if (this.isDemoMode) {
      console.log(`[bKash Demo] Simulating refund of BDT ${amount} for paymentID ${paymentID}`);
      const demoRefundTrxID = `DEMO_REFUND_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      this.logTokenToFile('REFUND-DEMO', { paymentID, amount, demoRefundTrxID });
      return {
        success: true,
        transactionID: demoRefundTrxID,
        originalTransactionID: trxID,
        amount: amount.toString(),
        refundTrxID: demoRefundTrxID,
        statusMessage: 'Refund Successful (Demo)',
        isDemo: true
      };
    }

    try {
      const token = await this.getAccessToken();

      const payload = {
        paymentID,
        amount: Number(parseFloat(amount).toFixed(2)).toString(),
        trxID,
        sku: reason || 'Booking Refund',
        reason: reason || 'Booking Refund'
      };

      console.log('[bKash] Initiating refund:', payload);

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/payment/refund`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.merchantKey
          }
        }
      );

      this.logTokenToFile('REFUND-RESPONSE', response.data);
      console.log('[bKash] Refund response:', response.data);

      const statusCode = response.data?.statusCode;

      if (statusCode === '0000') {
        // Success
        return {
          success: true,
          transactionID: response.data.trxID,
          originalTransactionID: trxID,
          amount: response.data.amount,
          refundTrxID: response.data.refundTrxID || response.data.trxID,
          statusMessage: response.data.statusMessage || 'Refund Successful'
        };
      } else if (statusCode === '2041') {
        // Duplicate refund — refund was already processed
        console.warn('[bKash] Refund already processed (2041). Treating as success.');
        return {
          success: true,
          transactionID: trxID,
          originalTransactionID: trxID,
          amount: amount.toString(),
          refundTrxID: trxID,
          statusMessage: 'Refund already processed (duplicate)'
        };
      } else {
        const reason = response.data?.statusMessage || 'Refund failed';
        console.error('[bKash] Refund failed:', response.data);
        return { success: false, error: reason, statusCode, rawResponse: response.data };
      }

    } catch (error) {
      const errMsg = error.response?.data?.statusMessage || error.response?.data?.errorMessage || error.message;
      this.logTokenToFile('REFUND-ERROR', { paymentID, error: errMsg });
      console.error('[bKash] Refund error:', error.response?.data || error.message);
      return { success: false, error: errMsg };
    }
  }


  // --------------------------------------------------------
  // DISBURSEMENT (B2C Payout to host/owner mobile number)
  // --------------------------------------------------------
  async disbursePayout(amount, mobileNumber, payoutReference) {
    // Demo mode — simulate a successful disbursement without hitting real API
    if (this.isDemoMode) {
      console.log(`[bKash Demo] Simulating disbursement of BDT ${amount} to ${mobileNumber}`);
      const demoTrxID = `DEMO_DISB_BKASH_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      return {
        success: true,
        transactionID: demoTrxID,
        amount: amount.toString(),
        receiver: mobileNumber,
        statusMessage: 'Disbursement Successful (Demo)',
        isDemo: true
      };
    }

    try {
      const token = await this.getAccessToken();

      // bKash B2C / disbursement transfer endpoint
      // Note: Requires merchant account with disbursement feature enabled
      const payload = {
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'disbursement',
        merchantInvoiceNumber: `PAYOUT_${payoutReference}_${Date.now()}`,
        receiverMSISDN: mobileNumber
      };

      console.log('[bKash] Outgoing disbursement payload:', payload);
      this.logTokenToFile('DISBURSE-REQUEST', { payload, token: token.substring(0, 30) + '...' });

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/disbursement`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.merchantKey
          }
        }
      );

      this.logTokenToFile('DISBURSE-RESPONSE', response.data);

      if (response.data && (response.data.transactionStatus === 'Completed' || response.data.statusCode === '0000')) {
        console.log('bKash disbursement successful:', response.data.trxID || response.data.transactionID);
        return {
          success: true,
          transactionID: response.data.trxID || response.data.transactionID,
          amount: response.data.amount || amount.toString(),
          receiver: mobileNumber,
          statusMessage: response.data.statusMessage || 'Disbursement Successful'
        };
      } else {
        const reason = response.data?.statusMessage || response.data?.errorMessage || 'Disbursement failed';
        console.error('bKash disbursement unsuccessful:', reason);
        return { success: false, error: reason, rawResponse: response.data };
      }
    } catch (error) {
      const isAuthError = error.response?.status === 403 || error.response?.status === 401;
      const errMsg = error.response?.data?.statusMessage || error.response?.data?.errorMessage || error.message;
      
      this.logTokenToFile('DISBURSE-ERROR', { status: error.response?.status, error: errMsg });

      // If we are in Sandbox mode and receive an authorization / forbidden error (meaning standard
      // checkout sandbox keys are used instead of special B2C disbursement keys), fall back to
      // simulating a successful disbursement to allow developers to verify the workflow.
      if (!this.isLive && isAuthError) {
        console.warn(`[bKash Sandbox Fallback] Received ${error.response?.status} from bKash disbursement API. Falling back to simulation for sandbox testing.`);
        const demoTrxID = `DEMO_DISB_BKASH_FALLBACK_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return {
          success: true,
          transactionID: demoTrxID,
          amount: amount.toString(),
          receiver: mobileNumber,
          statusMessage: 'Disbursement Simulated (Sandbox Fallback)',
          isDemo: true
        };
      }

      console.error('bKash disbursement error:', errMsg);
      return { success: false, error: errMsg };
    }

  }
}

module.exports = BkashPaymentGateway;






