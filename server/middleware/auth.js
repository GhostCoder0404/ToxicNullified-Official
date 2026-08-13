const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'toxicnullified_super_secret_jwt_key_2026';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = {
  verifyToken,
  JWT_SECRET
};
