const { User, Notification } = require('../models');

exports.notifyUser = (user, message) => (user ? Notification.create({ user, message }) : null);

exports.notifyStaff = async (message) => {
  const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).select('_id');
  if (staff.length) await Notification.insertMany(staff.map((u) => ({ user: u._id, message })));
};

// builds a case-insensitive "contains" filter across several fields
exports.searchFilter = (q, fields) => {
  if (!q) return null;
  const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return { $or: fields.map((f) => ({ [f]: rx })) };
};
