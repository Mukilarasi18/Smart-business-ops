const router = require('express').Router();
const { ServiceRequest, Client } = require('../models');
const { wrap, protect, allow } = require('../middleware/auth');
const { notifyUser, notifyStaff, searchFilter } = require('../utils/helpers');

router.use(protect);

router.get('/', wrap(async (req, res) => {
  const filter = {};
  if (req.user.role === 'client') {
    const profile = await Client.findOne({ user: req.user._id });
    filter.client = profile ? profile._id : null;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  const s = searchFilter(req.query.q, ['title', 'description']);
  if (s) Object.assign(filter, s);
  res.json(await ServiceRequest.find(filter).populate('client', 'name company').sort('-createdAt'));
}));

router.post('/', wrap(async (req, res) => {
  const data = { ...req.body };
  if (req.user.role === 'client') {
    const profile = await Client.findOne({ user: req.user._id });
    if (!profile) return res.status(400).json({ message: 'Client profile not found' });
    data.client = profile._id;
    data.status = 'Pending';
  }
  const doc = await ServiceRequest.create(data);
  await notifyStaff('New service request: ' + doc.title);
  res.status(201).json(doc);
}));

router.put('/:id', allow('admin', 'staff'), wrap(async (req, res) => {
  const old = await ServiceRequest.findById(req.params.id);
  if (!old) return res.status(404).json({ message: 'Request not found' });
  Object.assign(old, req.body);
  await old.save();
  const doc = await old.populate('client', 'name company user');
  if (req.body.status) await notifyUser(doc.client.user, `Your request "${doc.title}" is now ${doc.status}`);
  res.json(doc);
}));

router.delete('/:id', allow('admin'), wrap(async (req, res) => {
  await ServiceRequest.findByIdAndDelete(req.params.id);
  res.json({ message: 'Request deleted' });
}));

module.exports = router;
