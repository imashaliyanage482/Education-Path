const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');
const AdminUser = require('./models/AdminUser');

// Helper to hash password with PBKDF2
const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

const seedAdminUser = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await connectDB();

    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@.lk';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin12';
    const adminName = 'EduPath Chief Administrator';

    console.log(`Seeding Admin account: ${adminEmail}...`);

    // Generate random cryptographic salt
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(adminPassword, salt);

    // Upsert admin user
    const existingAdmin = await AdminUser.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.name = adminName;
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.salt = salt;
      existingAdmin.role = 'ADMIN';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`✅ Existing Admin account updated with new secure hash: ${adminEmail} (Role: ADMIN)`);
    } else {
      const newAdmin = new AdminUser({
        name: adminName,
        email: adminEmail,
        passwordHash,
        salt,
        role: 'ADMIN',
        isActive: true,
      });
      await newAdmin.save();
      console.log(`✅ New Admin account securely created in database: ${adminEmail} (Role: ADMIN)`);
    }

    console.log('🔒 Server-side Admin seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during Admin seed:', error);
    process.exit(1);
  }
};

seedAdminUser();
