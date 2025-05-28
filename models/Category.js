const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['workOrder', 'asset', 'part'], // Only allow these two values
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);