const router = require('express').Router();
const { Quotation, Client, Project } = require('../models');
const { wrap, protect, allow } = require('../middleware/auth');
const { notifyUser, notifyStaff, searchFilter } = require('../utils/helpers');

router.use(protect);

const total = (items = []) => items.reduce((sum, i) => sum + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
const populate = (q) => q.populate('client', 'name company user').populate('request', 'title');

router.get('/', wrap(async (req, res) => {
  const filter = {};
  if (req.user.role === 'client') {
    const profile = await Client.findOne({ user: req.user._id });
    filter.client = profile ? profile._id : null;
    filter.status = { $ne: 'Draft' }; // clients never see drafts
  }
  if (req.query.status && req.user.role !== 'client') filter.status = req.query.status;
  const s = searchFilter(req.query.q, ['number', 'notes']);
  if (s) Object.assign(filter, s);
  res.json(await populate(Quotation.find(filter)).sort('-createdAt'));
}));

router.post('/', allow('admin', 'staff'), wrap(async (req, res) => {
  const data = { ...req.body, total: total(req.body.items) };
  data.number = 'Q-' + Date.now().toString().slice(-6);
  if (!data.request) delete data.request;
  const q = await Quotation.create(data);
  const doc = await populate(Quotation.findById(q._id));
  if (doc.status === 'Sent') await notifyUser(doc.client.user, `You have a new quotation ${doc.number}`);
  res.status(201).json(doc);
}));

router.put('/:id', allow('admin', 'staff'), wrap(async (req, res) => {
  const q = await Quotation.findById(req.params.id);
  if (!q) return res.status(404).json({ message: 'Quotation not found' });
  const wasSent = q.status === 'Sent';
  Object.assign(q, req.body);
  if (!q.request) q.request = undefined;
  q.total = total(q.items);
  await q.save();
  const doc = await populate(Quotation.findById(q._id));
  if (!wasSent && doc.status === 'Sent') await notifyUser(doc.client.user, `You have a new quotation ${doc.number}`);
  res.json(doc);
}));

// client accepts or rejects a quotation that was sent to them
router.put('/:id/respond', allow('client'), wrap(async (req, res) => {
  const { status } = req.body;
  if (!['Accepted', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Invalid response' });
  const profile = await Client.findOne({ user: req.user._id });
  const q = await Quotation.findById(req.params.id);
  if (!q || !profile || String(q.client) !== String(profile._id)) return res.status(404).json({ message: 'Quotation not found' });
  if (q.status !== 'Sent') return res.status(400).json({ message: 'This quotation has already been answered' });
  q.status = status;
  await q.save();
  if (status === 'Accepted') {
    await Project.create({ name: 'Project for ' + q.number, client: q.client, quotation: q._id });
  }
  await notifyStaff(`Quotation ${q.number} was ${status.toLowerCase()} by ${profile.name}`);
  res.json(await populate(Quotation.findById(q._id)));
}));

router.delete('/:id', allow('admin'), wrap(async (req, res) => {
  await Quotation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Quotation deleted' });
}));

module.exports = router;
