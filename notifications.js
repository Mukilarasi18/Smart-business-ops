const router = require('express').Router();
const { Notification } = require('../models');
const { wrap, protect } = require('../middleware/auth');

router.use(protect);

router.get('/', wrap(async (req, res) => {
  res.json(await Notification.find({ user: req.user._id }).sort('-createdAt').limit(20));
}));

router.put('/read-all', wrap(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: 'All marked as read' });
}));

router.put('/:id/read', wrap(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
  res.json({ message: 'Marked as read' });
}));

module.exports = router;
