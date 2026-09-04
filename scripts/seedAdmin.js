require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const username = 'admin';
    const email = 'admin@example.com';
    const existing = await Admin.findOne({ $or: [{ username }, { email }] });

    if (existing) {
      existing.password = 'admin123';
      existing.username = username;
      existing.name = existing.name || 'System Admin';
      await existing.save();
      console.log('========================================');
      console.log('Admin account updated / already exists:');
      console.log('========================================');
      console.log(`  Username: ${username}`);
      console.log(`  Email:    ${email}`);
      console.log(`  Password: admin123`);
      console.log('========================================');
      process.exit(0);
    }

    const admin = await Admin.create({
      name: 'System Admin',
      username,
      email,
      password: 'admin123',
      phone: ''
    });

    console.log('========================================');
    console.log('Default Admin account created successfully!');
    console.log('========================================');
    console.log(`  Name:     ${admin.name}`);
    console.log(`  Username: ${username}`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: admin123`);
    console.log('========================================');
    console.log('IMPORTANT: Change this password after first login.');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
