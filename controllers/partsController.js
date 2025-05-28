const Part = require('../models/Parts');

// Create a new part
exports.createPart = async (req, res) => {
  try {
    const { partName, partNumber, category, barCode, availableQuantity, building, customer, description, manufacturer, purchaseDate, purchaseCost, qrCode } = req.body;
    const part = new Part({ partName, partNumber, category, barCode, availableQuantity, building, customer, description, manufacturer, purchaseDate, purchaseCost, qrCode });
    await part.save();
    res.status(201).json({ success: true, data: part });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all parts
exports.getAllParts = async (req, res) => {
  try {
    const parts = await Part.find().populate('category building customer manufacturer');
    res.status(200).json({ success: true, data: parts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get part by ID
exports.getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).populate('category building customer manufacturer');
    if (!part) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    res.status(200).json({ success: true, data: part });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update part by ID
exports.updatePart = async (req, res) => {
  try {
    const { partName, partNumber, category, barCode, availableQuantity, building, customer, description, manufacturer, purchaseDate, purchaseCost, qrCode } = req.body;
    const part = await Part.findByIdAndUpdate(
      req.params.id,
      { partName, partNumber, category, barCode, availableQuantity, building, customer, description, manufacturer, purchaseDate, purchaseCost, qrCode },
      { new: true, runValidators: true }
    ).populate('category building customer manufacturer');
    if (!part) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    res.status(200).json({ success: true, data: part });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete part by ID
exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    res.status(200).json({ success: true, message: 'Part deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};