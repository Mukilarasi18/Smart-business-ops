const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name });

const User = mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'client'], default: 'client' },
}, { timestamps: true }));

const Client = mongoose.model('Client', new Schema({
  user: ref('User'),
  name: { type: String, required: true, trim: true },
  email: String,
  phone: String,
  company: String,
  address: String,
  notes: String,
}, { timestamps: true }));

const ServiceRequest = mongoose.model('ServiceRequest', new Schema({
  client: { ...ref('Client'), required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'], default: 'Pending' },
}, { timestamps: true }));

const Quotation = mongoose.model('Quotation', new Schema({
  number: String,
  client: { ...ref('Client'), required: true },
  request: ref('ServiceRequest'),
  items: [{ description: String, qty: { type: Number, default: 1 }, price: { type: Number, default: 0 } }],
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Sent', 'Accepted', 'Rejected'], default: 'Draft' },
  notes: String,
}, { timestamps: true }));

const Project = mongoose.model('Project', new Schema({
  name: { type: String, required: true, trim: true },
  client: { ...ref('Client'), required: true },
  quotation: ref('Quotation'),
  description: String,
  status: { type: String, enum: ['Not Started', 'In Progress', 'On Hold', 'Completed'], default: 'Not Started' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  startDate: Date,
  dueDate: Date,
}, { timestamps: true }));

const Notification = mongoose.model('Notification', new Schema({
  user: { ...ref('User'), required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true }));

module.exports = { User, Client, ServiceRequest, Quotation, Project, Notification };
