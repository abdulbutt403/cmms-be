const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: [true, 'Vendor Name is required'],
    trim: true,
    unique: true
  },
  vendorType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorType',
    required: [true, 'Vendor Type is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  website: {
    type: String,
    required: [true, 'Website is required'],
    trim: true,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please enter a valid website URL']
  },
  contactName: {
    type: String,
    required: [true, 'Contact Name is required'],
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact Phone is required'],
    trim: true,
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
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

module.exports = mongoose.model('Vendor', VendorSchema);