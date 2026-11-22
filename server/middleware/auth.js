const jwt = require('jsonwebtoken');
const { User } = require('../models');

// lets async route handlers pass errors to Express
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const protect = wrap(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in to continue' });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Session expired. Please log in again' });
  }
  const user = await User.findById(decoded.id).select('-password');
  if (!user) return res.status(401).json({ message: 'Account not found' });
  req.user = user;
  next();
});

const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have access to this action' });

module.exports = { wrap, protect, allow };
