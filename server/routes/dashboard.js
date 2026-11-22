const router = require('express').Router();
const { Client, ServiceRequest, Quotation, Project } = require('../models');
const { wrap, protect, allow } = require('../middleware/auth');

router.use(protect);

const groupBy = (docs, key) => docs.reduce((acc, d) => ((acc[d[key]] = (acc[d[key]] || 0) + 1), acc), {});

router.get('/', wrap(async (req, res) => {
  const isClient = req.user.role === 'client';
  let scope = {};
  if (isClient) {
    const profile = await Client.findOne({ user: req.user._id });
    scope = { client: profile ? profile._id : null };
  }
  const [clients, requests, quotations, projects] = await Promise.all([
    isClient ? Client.find({ user: req.user._id }) : Client.find(),
    ServiceRequest.find(scope).populate('client', 'name').sort('-createdAt'),
    Quotation.find(isClient ? { ...scope, status: { $ne: 'Draft' } } : scope),
    Project.find(scope),
  ]);
  res.json({
    counts: { clients: clients.length, requests: requests.length, quotations: quotations.length, projects: projects.length },
    requestsByStatus: groupBy(requests, 'status'),
    projectsByStatus: groupBy(projects, 'status'),
    quotationsByStatus: groupBy(quotations, 'status'),
    acceptedValue: quotations.filter((q) => q.status === 'Accepted').reduce((s, q) => s + q.total, 0),
    recentRequests: requests.slice(0, 5),
  });
}));

// CSV export for the reporting feature
router.get('/report/:type', allow('admin', 'staff'), wrap(async (req, res) => {
  const type = req.params.type;
  let header, rows;
  if (type === 'clients') {
    const d = await Client.find();
    header = ['Name', 'Email', 'Phone', 'Company'];
    rows = d.map((c) => [c.name, c.email, c.phone, c.company]);
  } else if (type === 'requests') {
    const d = await ServiceRequest.find().populate('client', 'name');
    header = ['Title', 'Client', 'Priority', 'Status', 'Created'];
    rows = d.map((r) => [r.title, r.client && r.client.name, r.priority, r.status, r.createdAt.toISOString().slice(0, 10)]);
  } else if (type === 'quotations') {
    const d = await Quotation.find().populate('client', 'name');
    header = ['Number', 'Client', 'Total', 'Status', 'Created'];
    rows = d.map((q) => [q.number, q.client && q.client.name, q.total, q.status, q.createdAt.toISOString().slice(0, 10)]);
  } else if (type === 'projects') {
    const d = await Project.find().populate('client', 'name');
    header = ['Name', 'Client', 'Status', 'Progress', 'Due date'];
    rows = d.map((p) => [p.name, p.client && p.client.name, p.status, p.progress + '%', p.dueDate ? p.dueDate.toISOString().slice(0, 10) : '']);
  } else return res.status(400).json({ message: 'Unknown report type' });

  const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
}));

module.exports = router;
