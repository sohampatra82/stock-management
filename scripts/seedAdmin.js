require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@example.com';
    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log('Admin account already exists:');
      console.log(`  Email: ${email}`);
      console.log('  (Password remains unchanged)');
      process.exit(0);
    }

    const admin = await Admin.create({
      name: 'System Admin',
      email,
      password: 'Admin@123',
      phone: ''
    });

    console.log('========================================');
    console.log('Default Admin account created successfully!');
    console.log('========================================');
    console.log(`  Name:     ${admin.name}`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: Admin@123`);
    console.log('========================================');
    console.log('IMPORTANT: Change this password immediately after first login.');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
