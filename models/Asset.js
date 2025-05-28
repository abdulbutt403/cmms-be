const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AssetSchema = new mongoose.Schema({
  assetName: {
    type: String,
    required: [true, 'Asset Name is required'],
    trim: true
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: [true, 'Building is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Retired'],
    default: 'Active',
    required: [true, 'Status is required']
  },
  serialNumber: {
    type: String,
    trim: true
  },
  modelNumber: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  purchaseCost: {
    type: Number,
    min: 0
  },
  warrantyExpiryDate: {
    type: Date
  },
  assignee: {
    type: String,
    enum: ['User', 'Team'],
    required: [true, 'Assignee type is required']
  },
  assignedTo: {
    type: String,
    required: [true, 'Assigned To is required']
  },
  qrCode: {
    type: String,
    unique: true,
    default: () => uuidv4() // Generate a unique QR code identifier
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

module.exports = mongoose.model('Asset', AssetSchema);