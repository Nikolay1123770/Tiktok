const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class YooMoneyService {
  constructor() {
    this.clientId = process.env.YOOMONEY_CLIENT_ID;
    this.clientSecret = process.env.YOOMONEY_CLIENT_SECRET;
    this.redirectUri = process.env.YOOMONEY_REDIRECT_URI;
    this.shopId = process.env.YOOMONEY_SHOP_ID;
    this.secretKey = process.env.YOOMONEY_SECRET_KEY;
    this.baseUrl = 'https://yoomoney.ru/api';
  }

  // Создание платежа
  async createPayment(amount, description, userId, returnUrl) {
    try {
      const idempotenceKey = crypto.randomUUID();
      
      const response = await axios.post(
        'https://api.yookassa.ru/v3/payments',
        {
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB'
          },
          confirmation: {
            type: 'redirect',
            return_url: returnUrl || `${process.env.SITE_URL}/payment/success`
          },
          capture: true,
          description: description,
          metadata: {
            user_id: userId
          }
        },
        {
          auth: {
            username: this.shopId,
            password: this.secretKey
          },
          headers: {
            'Idempotence-Key': idempotenceKey,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Payment created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('YooMoney payment creation error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Проверка статуса платежа
  async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(
        `https://api.yookassa.ru/v3/payments/${paymentId}`,
        {
          auth: {
            username: this.shopId,
            password: this.secretKey
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('YooMoney status check error:', error.message);
      throw error;
    }
  }

  // Проверка подписи webhook
  verifyWebhookSignature(body, signature) {
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(body))
      .digest('hex');
    
    return hash === signature;
  }

  // Обработка webhook от YooMoney
  async handleWebhook(event) {
    try {
      const { type, object } = event;

      if (type === 'payment.succeeded') {
        const { id, amount, metadata, status } = object;
        
        logger.info(`Payment succeeded: ${id}, amount: ${amount.value}`);
        
        return {
          success: true,
          paymentId: id,
          userId: metadata.user_id,
          amount: parseFloat(amount.value)
        };
      }

      return { success: false };
    } catch (error) {
      logger.error('Webhook handling error:', error.message);
      throw error;
    }
  }
}

module.exports = new YooMoneyService();