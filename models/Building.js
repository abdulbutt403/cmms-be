const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
  buildingName: {
    type: String,
    required: [true, 'Building Name is required'],
    trim: true,
    unique: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact Person is required'],
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact Number is required'],
    trim: true,
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Building', BuildingSchema);