// src/middleware/userAuthMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();
function isUser(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize payload so downstream code can rely on req.user.userId
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id,
    }; 
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = { isUser };