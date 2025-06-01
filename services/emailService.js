const nodemailer = require('nodemailer');
const logger = require('../utils/logger/logger');
const passwordResetTemplate = require('../utils/templates/passwordResetTemplate');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: "sujalkareliya27@gmail.com",
        pass: "bdsl zvti oxtj yhxs",
      },
    });
  }

  async sendPasswordResetOTP(to, otp) {
    const mailOptions = {
      from: `"URL Shortener Support">`,
      to,
      subject: 'Password Reset OTP',
      html: passwordResetTemplate(otp),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Reset OTP sent to ${to}`);
    } catch (error) {
      console.log(error);
      logger.error(`Failed to send OTP to ${to}:`, error);
      throw new Error('Failed to send OTP email');
    }
  }
}

module.exports = new EmailService();
