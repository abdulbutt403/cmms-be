const fs = require('fs');
const path = require('path');
const Part = require('../models/Parts');

// Create a new part
exports.createPart = async (req, res) => {
  try {
    const {
      partName, partNumber, category, barCode, availableQuantity,
      building, customer, description, manufacturer,
      purchaseDate, purchaseCost, qrCode
    } = req.body;

    const partPhoto = req.file?.filename ? `/uploads/parts/${req.file.filename}` : '';

    const part = new Part({
      partName, partNumber, category, barCode, availableQuantity,
      building, customer, description, manufacturer,
      purchaseDate, purchaseCost, qrCode,
      partPhoto
    });

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
    const {
      partName, partNumber, category, barCode, availableQuantity,
      building, customer, description, manufacturer,
      purchaseDate, purchaseCost, qrCode
    } = req.body;

    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    // Update fields
    part.partName = partName ?? part.partName;
    part.partNumber = partNumber ?? part.partNumber;
    part.category = category ?? part.category;
    part.barCode = barCode ?? part.barCode;
    part.availableQuantity = availableQuantity ?? part.availableQuantity;
    part.building = building ?? part.building;
    part.customer = customer ?? part.customer;
    part.description = description ?? part.description;
    part.manufacturer = manufacturer ?? part.manufacturer;
    part.purchaseDate = purchaseDate ?? part.purchaseDate;
    part.purchaseCost = purchaseCost ?? part.purchaseCost;
    part.qrCode = qrCode ?? part.qrCode;

    // Handle new photo upload (optional)
    if (req.file?.filename) {
      // Delete old photo if it exists
      if (part.partPhoto) {
        const oldPath = path.join(__dirname, '..', 'public', part.partPhoto);
        fs.unlink(oldPath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error deleting old part photo:', err.message);
          }
        });
      }
      part.partPhoto = `/uploads/parts/${req.file.filename}`;
    }

    await part.save();
    res.status(200).json({ success: true, data: part });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete part by ID
exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    // Delete the photo if exists
    if (part.partPhoto) {
      const photoPath = path.join(__dirname, '..', 'public', part.partPhoto);
      fs.unlink(photoPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting part photo:', err.message);
        }
      });
    }

    await part.deleteOne();

    res.status(200).json({ success: true, message: 'Part deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
