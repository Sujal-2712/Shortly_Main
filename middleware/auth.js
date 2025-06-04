const jwt = require('jsonwebtoken');
const { USER } = require('../models/User');
const logger = require('../utils/logger/logger');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. Invalid token format.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    const user = await USER.findById(decoded.userId).select('is_active');
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. User not found or inactive.'
      });
    }

    req.user = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Token expired.' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error during authentication.' 
    });
  }
};

module.exports = { auth };