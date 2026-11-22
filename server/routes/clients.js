const router = require('express').Router();
const { Client } = require('../models');
const { wrap, protect, allow } = require('../middleware/auth');
const { searchFilter } = require('../utils/helpers');

router.use(protect);

router.get('/', wrap(async (req, res) => {
  const filter = {};
  if (req.user.role === 'client') filter.user = req.user._id;
  const s = searchFilter(req.query.q, ['name', 'email', 'company', 'phone']);
  if (s) Object.assign(filter, s);
  res.json(await Client.find(filter).sort('-createdAt'));
}));

router.post('/', allow('admin', 'staff'), wrap(async (req, res) => {
  res.status(201).json(await Client.create(req.body));
}));

router.put('/:id', allow('admin', 'staff'), wrap(async (req, res) => {
  const c = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!c) return res.status(404).json({ message: 'Client not found' });
  res.json(c);
}));

router.delete('/:id', allow('admin'), wrap(async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json({ message: 'Client deleted' });
}));

module.exports = router;
