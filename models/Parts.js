const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  partName: { type: String, required: true, trim: true },
  partNumber: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  barCode: { type: String, trim: true },
  availableQuantity: { type: Number, required: true, min: 0 },
  building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  description: { type: String, trim: true },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  purchaseDate: { type: Date },
  purchaseCost: { type: Number, min: 0 },
  qrCode: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Part', partSchema);