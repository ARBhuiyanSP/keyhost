const crypto = require('crypto');
const axios = require('axios');
const { pool } = require('../config/database');

class NagadPaymentGateway {
  constructor() {
    this.baseURL = '';
    this.merchantId = '';
    this.privateKey = '';
    this.nagadPublicKey = '';
    this.isDemoMode = false;
    this.isLive = false;
  }

  async initialize() {
    try {
      // Get Nagad settings from database
      const [settings] = await pool.execute(`
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE setting_key LIKE 'nagad_%'
      `);

      const nagadSettings = {};
      settings.forEach(setting => {
        nagadSettings[setting.setting_key] = setting.setting_value;
      });

      this.isLive = nagadSettings.nagad_is_live === 'true';
      const liveSandboxURL = this.isLive
        ? 'https://api.mynagad.com'
        : 'https://sandbox.mynagad.com:10080';
      this.baseURL = nagadSettings.nagad_api_url || liveSandboxURL;
      this.merchantId = nagadSettings.nagad_merchant_id || '';
      this.privateKey = nagadSettings.nagad_merchant_private_key || nagadSettings.nagad_private_key || '';
      this.nagadPublicKey = nagadSettings.nagad_public_key || '';

      // Callback URL points to backend GET /callback
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      this.callbackURL = `${backendUrl}/api/nagad/callback`;

      // If credentials are missing → demo mode
      this.isDemoMode = !this.merchantId || !this.privateKey;

      if (this.isDemoMode) {
        console.warn('Nagad Payment Gateway initialized in Demo/Simulation mode (missing API credentials)');
      } else {
        console.log(`Nagad Payment Gateway initialized successfully in ${this.isLive ? 'LIVE' : 'SANDBOX'} mode.`);
      }
    } catch (error) {
      console.error('Failed to initialize Nagad gateway:', error);
      this.isDemoMode = true; // Safe fallback
    }
  }

  // ---------------------------------------------------------
  // REAL API HELPER METHODS (Nagad encryption & signing)
  // ---------------------------------------------------------
  encryptWithNagadPublicKey(data) {
    try {
      const buffer = Buffer.from(JSON.stringify(data));
      // Encrypt with Nagad's Public Key
      const encrypted = crypto.publicEncrypt(
        {
          key: this.nagadPublicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        buffer
      );
      return encrypted.toString('base64');
    } catch (err) {
      console.error('Nagad encryption error:', err);
      throw err;
    }
  }

  decryptWithPrivateKey(encryptedDataBase64) {
    try {
      const buffer = Buffer.from(encryptedDataBase64, 'base64');
      // Decrypt with Merchant's Private Key
      const decrypted = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        buffer
      );
      return JSON.parse(decrypted.toString());
    } catch (err) {
      console.error('Nagad decryption error:', err);
      throw err;
    }
  }

  generateSignature(data) {
    try {
      const signer = crypto.createSign('SHA256');
      signer.update(JSON.stringify(data));
      return signer.sign(this.privateKey, 'base64');
    } catch (err) {
      console.error('Nagad signature generation error:', err);
      throw err;
    }
  }

  // ---------------------------------------------------------
  // GATEWAY OPERATIONAL METHODS
  // ---------------------------------------------------------
  async createPayment(amount, bookingId, customerInfo) {
    if (this.isDemoMode) {
      return this.createDemoPayment(amount, bookingId);
    }

    try {
      const orderId = `BOOKING_${bookingId}_${Date.now()}`;

      // Step 1: Initialize payment request
      const sensitiveData = {
        merchantId: this.merchantId,
        datetime: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        orderId,
        amount: amount.toFixed(2),
        currencyCode: '050', // BDT ISO Code
        challenge: crypto.randomBytes(16).toString('hex')
      };

      const encryptedData = this.encryptWithNagadPublicKey(sensitiveData);
      const signature = this.generateSignature(sensitiveData);

      // Step 2: Call Nagad init API
      const response = await axios.post(
        `${this.baseURL}/remote-payment-gateway-1.0/api/dfs/check-out/initialize/${this.merchantId}/${orderId}`,
        { dateTime: sensitiveData.datetime, sensitiveData: encryptedData, signature },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-KM-Api-Version': 'v-0.2.0',
            'X-KM-IP-V4': '127.0.0.1',
            'X-KM-Client-Type': 'PC_WEB'
          }
        }
      );

      if (response.data && response.data.sensitiveData) {
        // Step 3: Decrypt init response to get paymentReferenceId
        const decryptedInit = this.decryptWithPrivateKey(response.data.sensitiveData);

        // Step 4: Complete payment (get checkout URL)
        const completePayload = {
          merchantId: this.merchantId,
          orderId,
          currencyCode: '050',
          challengeAck: decryptedInit.challenge,
          paymentRefId: decryptedInit.paymentReferenceId,
          amount: amount.toFixed(2),
          merchantCallbackURL: this.callbackURL
        };
        const encryptedComplete = this.encryptWithNagadPublicKey(completePayload);
        const signatureComplete = this.generateSignature(completePayload);

        const completeResponse = await axios.post(
          `${this.baseURL}/remote-payment-gateway-1.0/api/dfs/check-out/complete/${decryptedInit.paymentReferenceId}`,
          { sensitiveData: encryptedComplete, signature: signatureComplete, merchantCallbackURL: this.callbackURL },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-KM-Api-Version': 'v-0.2.0',
              'X-KM-IP-V4': '127.0.0.1',
              'X-KM-Client-Type': 'PC_WEB'
            }
          }
        );

        if (completeResponse.data && completeResponse.data.status === 'Success') {
          return {
            success: true,
            paymentID: decryptedInit.paymentReferenceId,
            paymentRefId: decryptedInit.paymentReferenceId,
            nagadURL: completeResponse.data.callBackUrl,
            isDemo: false
          };
        } else {
          throw new Error(completeResponse.data?.reason || 'Payment completion failed');
        }
      } else {
        throw new Error(response.data?.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Nagad payment creation error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async verifyPayment(paymentRef) {
    if (this.isDemoMode || paymentRef.startsWith('DEMO_')) {
      return {
        success: true,
        transactionID: `DEMO_NAGAD_TXN_${Date.now()}`,
        amount: '100.00',
        paymentID: paymentRef,
        status: 'Success',
        isDemo: true
      };
    }

    try {
      // Call Nagad API to check transaction status
      const response = await axios.get(`${this.baseURL}/payment-verification/${paymentRef}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-1.0',
          'X-KM-Client-Type': 'PC_WEB'
        }
      });

      if (response.data && response.data.sensitiveData) {
        const decryptedResponse = this.decryptWithPrivateKey(response.data.sensitiveData);
        return {
          success: true,
          transactionID: decryptedResponse.issuerPaymentRefNo,
          amount: decryptedResponse.amount,
          paymentID: paymentRef,
          status: decryptedResponse.status, // "Success", "Failed"
          sensitiveData: decryptedResponse
        };
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Nagad payment verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ---------------------------------------------------------
  // DEMO MODE METHODS
  // ---------------------------------------------------------
  createDemoPayment(amount, bookingId) {
    console.log('Creating demo Nagad payment...');
    const demoPaymentID = `DEMO_NAG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    // Points to backend simulation endpoint for full demo checkout cycle
    const demoNagadURL = `${backendUrl}/api/nagad/simulate-demo?paymentRefId=${demoPaymentID}&bookingId=${bookingId}`;

    return {
      success: true,
      paymentID: demoPaymentID,
      paymentRefId: demoPaymentID,
      nagadURL: demoNagadURL,
      isDemo: true
    };
  }

  // --------------------------------------------------------
  // DISBURSEMENT (B2C Payout to host/owner mobile number)
  // --------------------------------------------------------
  async disbursePayout(amount, mobileNumber, payoutReference) {
    // Demo mode — simulate a successful disbursement without hitting real API
    if (this.isDemoMode) {
      console.log(`[Nagad Demo] Simulating disbursement of BDT ${amount} to ${mobileNumber}`);
      const demoTrxID = `DEMO_DISB_NAGAD_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
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
      const orderId = `PAYOUT_${payoutReference}_${Date.now()}`;
      const datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

      // Nagad Disbursement payload (signed + encrypted similar to checkout)
      const sensitiveData = {
        merchantId: this.merchantId,
        datetime,
        orderId,
        amount: parseFloat(amount).toFixed(2),
        currencyCode: '050',
        receiverMSISDN: mobileNumber,
        challenge: require('crypto').randomBytes(16).toString('hex')
      };

      const encryptedData = this.encryptWithNagadPublicKey(sensitiveData);
      const signature = this.generateSignature(sensitiveData);

      // Nagad B2B / disbursement API endpoint
      const response = await axios.post(
        `${this.baseURL}/remote-payment-gateway-1.0/api/dfs/disburse/${this.merchantId}/${orderId}`,
        { dateTime: datetime, sensitiveData: encryptedData, signature },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-KM-Api-Version': 'v-0.2.0',
            'X-KM-IP-V4': '127.0.0.1',
            'X-KM-Client-Type': 'PC_WEB'
          }
        }
      );

      if (response.data && response.data.sensitiveData) {
        const decrypted = this.decryptWithPrivateKey(response.data.sensitiveData);
        if (decrypted.status === 'Success') {
          return {
            success: true,
            transactionID: decrypted.issuerPaymentRefNo,
            amount: decrypted.amount || amount.toString(),
            receiver: mobileNumber,
            statusMessage: 'Disbursement Successful'
          };
        } else {
          return { success: false, error: decrypted.reason || 'Disbursement failed at Nagad' };
        }
      } else {
        const reason = response.data?.message || 'Nagad disbursement API did not return expected response';
        console.error('Nagad disbursement unexpected response:', response.data);
        return { success: false, error: reason };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      console.error('Nagad disbursement error:', errMsg);
      return { success: false, error: errMsg };
    }
  }
}

module.exports = NagadPaymentGateway;

