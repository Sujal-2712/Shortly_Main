const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { USER } = require('../models/User');
const emailService = require('./../services/emailService');
const logger = require('../utils/logger/logger');
const { validationResult } = require('express-validator');

class AuthController {
  async signup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await USER.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = new USER({
        email,
        password: hashedPassword
      });

      await newUser.save();

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully'
      });

    } catch (error) {
      logger.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await USER.findOne({ email, is_active: true });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      user.last_login = new Date();
      await user.save();
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          profile_img: user.profile_img
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      logger.info(`User logged in: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            profile_img: user.profile_img,
            total_links: user.total_links
          }
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }


  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      const user = await USER.findOne({ email, is_active: true });
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If the email exists, a reset code has been sent'
        });
      }
      const otp = Math.floor(100000 + Math.random() * 900000);
      user.reset_password_otp = otp;
      user.reset_password_otp_expires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await emailService.sendPasswordResetOTP(user.email, otp);

      logger.info(`Password reset OTP sent to: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Reset code sent to your email',
        otp: otp,
      });

    } catch (error) {
      console.log(error);
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending reset code'
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { password } = req.body;
      const userId = req.user;

      const user = await USER.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
      user.reset_password_otp = null;
      user.reset_password_otp_expires = null;
      await user.save();

      logger.info(`Password reset successful for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting password'
      });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user;

      const user = await USER.findById(userId)
        .select('-password -reset_password_otp -reset_password_otp_expires')
        .populate({
          path: 'urls',
          select: 'title createdAt clicks',
          options: { sort: { createdAt: -1 }, limit: 5 }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile fetched successfully',
        data: user
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching profile'
      });
    }
  }
  async updateProfile(req, res) {
    try {
      const userId = req.user;
      const { profile_img } = req.body;

      const updatedUser = await USER.findByIdAndUpdate(
        userId,
        { profile_img },
        { new: true, select: '-password -reset_password_otp -reset_password_otp_expires' }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile'
      });
    }
  }
}

module.exports = new AuthController();