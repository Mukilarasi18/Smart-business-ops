const router = require('express').Router();
const { Project, Client } = require('../models');
const { wrap, protect, allow } = require('../middleware/auth');
const { notifyUser, searchFilter } = require('../utils/helpers');

router.use(protect);

router.get('/', wrap(async (req, res) => {
  const filter = {};
  if (req.user.role === 'client') {
    const profile = await Client.findOne({ user: req.user._id });
    filter.client = profile ? profile._id : null;
  }
  if (req.query.status) filter.status = req.query.status;
  const s = searchFilter(req.query.q, ['name', 'description']);
  if (s) Object.assign(filter, s);
  res.json(await Project.find(filter).populate('client', 'name company').populate('quotation', 'number').sort('-createdAt'));
}));

router.post('/', allow('admin', 'staff'), wrap(async (req, res) => {
  const data = { ...req.body };
  if (!data.quotation) delete data.quotation;
  const p = await Project.create(data);
  res.status(201).json(await p.populate('client', 'name company'));
}));

router.put('/:id', allow('admin', 'staff'), wrap(async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  const oldStatus = p.status;
  Object.assign(p, req.body);
  if (!p.quotation) p.quotation = undefined;
  if (p.status === 'Completed') p.progress = 100;
  await p.save();
  const doc = await p.populate([{ path: 'client', select: 'name company user' }, { path: 'quotation', select: 'number' }]);
  if (oldStatus !== p.status) await notifyUser(doc.client.user, `Project "${p.name}" is now ${p.status}`);
  res.json(doc);
}));

router.delete('/:id', allow('admin'), wrap(async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
}));

module.exports = router;
