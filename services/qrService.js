const QRCode = require('qrcode');
const logger = require('../utils/logger/logger');

class QRService {
  /**
   * Generate QR code for a URL
   */
  async generateQRCode(url) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      logger.info(`QR code generated for URL: ${url}`);
      return qrCodeDataURL;
    } catch (error) {
      logger.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Generate QR code as buffer
   */
  async generateQRCodeBuffer(url) {
    try {
      const buffer = await QRCode.toBuffer(url, {
        width: 256,
        margin: 2
      });

      return buffer;
    } catch (error) {
      logger.error('Error generating QR code buffer:', error);
      throw error;
    }
  }
}

module.exports = new QRService();