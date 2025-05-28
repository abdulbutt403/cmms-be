const mongoose = require('mongoose');

const VendorTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor Type Name is required'],
    trim: true,
    unique: true
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

module.exports = mongoose.model('VendorType', VendorTypeSchema);