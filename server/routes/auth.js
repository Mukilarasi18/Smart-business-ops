const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Client } = require('../models');
const { wrap, protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const out = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, phone, company, staffCode } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'This email is already registered' });

  // a valid staff code creates a staff account; everyone else becomes a client
  const role = staffCode && staffCode === process.env.STAFF_CODE ? 'staff' : 'client';
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role });
  if (role === 'client') await Client.create({ user: user._id, name, email, phone, company });
  res.status(201).json({ token: sign(user), user: out(user) });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(400).json({ message: 'Incorrect email or password' });
  res.json({ token: sign(user), user: out(user) });
}));

router.get('/me', protect, (req, res) => res.json(out(req.user)));

module.exports = router;
