const { Schema, model } = require('mongoose');
module.exports = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'farmer', 'admin'], default: 'buyer' },
  address: String,
  farmName: String,
  location: String, // farmers: e.g. "Co. Wicklow"
  bio: String,      // farmers: short story shown on the Farms page
}, { timestamps: true }));
