const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Authentication routes
router.post('/signup', 
  authLimiter,
  authValidation.signup,
  authController.signup
);

router.post('/login', 
  // authLimiter,
  authValidation.login,
  authController.login
);

router.post('/forgot-password',
  authLimiter,
  authValidation.forgotPassword,
  authController.forgotPassword
);

router.post('/reset-password',
  auth,
  authValidation.resetPassword,
  authController.resetPassword
);

router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
