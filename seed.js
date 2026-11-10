// Run once:  npm run seed   (creates an admin, a staff user and sample clients)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Client } = require('./models');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const pw = await bcrypt.hash('Admin@123', 10);
  await User.deleteMany({ email: { $in: ['admin@example.com', 'staff@example.com'] } });
  await User.create([
    { name: 'Admin', email: 'admin@example.com', password: pw, role: 'admin' },
    { name: 'Staff Member', email: 'staff@example.com', password: pw, role: 'staff' },
  ]);
  if ((await Client.countDocuments()) === 0) {
    await Client.create([
      { name: 'Ravi Kumar', email: 'ravi@brightmart.in', phone: '9840012345', company: 'BrightMart', address: 'T. Nagar, Chennai' },
      { name: 'Priya Nair', email: 'priya@greenleaf.in', phone: '9841123456', company: 'GreenLeaf Foods', address: 'Anna Nagar, Chennai' },
      { name: 'Arun Das', email: 'arun@techwave.in', phone: '9842234567', company: 'TechWave', address: 'Guindy, Chennai' },
    ]);
  }
  console.log('Seeded. Login: admin@example.com / Admin@123  (staff@example.com / Admin@123)');
  process.exit(0);
})();
