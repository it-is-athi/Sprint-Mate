const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/BlacklistedToken');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  // Blacklist check (must await!)
  const blacklisted = await BlacklistedToken.findOne({ token });
  if (blacklisted) {
    return res.status(401).json({ message: 'Token has been blacklisted. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};