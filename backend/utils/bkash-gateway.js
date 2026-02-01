const axios = require('axios');
const { pool } = require('../config/database');

class BkashPaymentGateway {
  constructor() {
    this.baseURL = '';
    this.merchantId = '';
    this.merchantKey = '';
    this.merchantSecret = '';
    this.accessToken = '';
    this.tokenExpiry = null;
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

      this.baseURL = bkashSettings.bkash_api_url || 'https://tokenized.pay.bka.sh/v1.2.0-beta';
      this.merchantId = bkashSettings.bkash_merchant_id || 'DEMO_MERCHANT_001';
      this.merchantKey = bkashSettings.bkash_merchant_key || 'DEMO_MERCHANT_KEY_123';
      this.merchantSecret = bkashSettings.bkash_merchant_secret || 'DEMO_MERCHANT_SECRET_456';

      console.log('bKash Payment Gateway initialized with demo credentials');
    } catch (error) {
      console.error('Failed to initialize bKash gateway:', error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post(`${this.baseURL}/tokenized/checkout/token/grant`, {
        app_key: this.merchantKey,
        app_secret: this.merchantSecret
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-APP-Key': this.merchantKey
        }
      });

      if (response.data && response.data.id_token) {
        this.accessToken = response.data.id_token;
        // Set token expiry (usually 1 hour)
        this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000); // 55 minutes
        console.log('bKash access token obtained');
        return this.accessToken;
      } else {
        throw new Error('Failed to get bKash access token');
      }
    } catch (error) {
      console.error('bKash token error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPayment(amount, bookingId, customerInfo) {
    try {
      const token = await this.getAccessToken();
      
      const paymentData = {
        mode: '0011', // Payment mode
        payerReference: customerInfo.phone || 'N/A',
        callbackURL: 'http://localhost:3000/payment/callback',
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `BOOKING_${bookingId}_${Date.now()}`
      };

      const response = await axios.post(`${this.baseURL}/tokenized/checkout/payment/create`, paymentData, {
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
        throw new Error('Failed to create bKash payment');
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
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.post(`${this.baseURL}/tokenized/checkout/payment/execute/${paymentID}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': this.merchantKey
        }
      });

      if (response.data) {
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
        throw new Error('Failed to execute bKash payment');
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
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseURL}/tokenized/checkout/payment/query/${paymentID}`, {
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
        throw new Error('Failed to query bKash payment');
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
    const demoBkashURL = `https://demo.bkash.com/payment/${demoPaymentID}`;
    
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
}

module.exports = BkashPaymentGateway;





