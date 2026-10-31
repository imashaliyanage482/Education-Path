const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    salt: { type: String },
    role: { type: String, enum: ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'], default: 'ADMIN' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminUser', AdminUserSchema);
