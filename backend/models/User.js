const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], required: false },
  otp: { type: String },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
