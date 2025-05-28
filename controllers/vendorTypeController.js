const { validationResult } = require('express-validator');
const VendorType = require('../models/VendorType');

// @desc    Get all vendor types
// @route   GET /api/vendor-types
// @access  Private/Manager
exports.getVendorTypes = async (req, res) => {
  try {
    // Managers should only see vendor types they've created
    const query = { createdBy: req.user._id };

    // Allow admins to see all vendor types
    if (req.user.userRole === 'admin') {
      delete query.createdBy;
    }

    const vendorTypes = await VendorType.find(query).sort('name');

    res.json({
      success: true,
      count: vendorTypes.length,
      data: vendorTypes
    });
  } catch (error) {
    console.error('Get vendor types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single vendor type
// @route   GET /api/vendor-types/:id
// @access  Private/Manager
exports.getVendorType = async (req, res) => {
  try {
    const vendorType = await VendorType.findById(req.params.id);

    if (!vendorType) {
      return res.status(404).json({
        success: false,
        message: 'Vendor Type not found'
      });
    }

    // Check if user has access to this record
    if (req.user.userRole !== 'admin' && vendorType.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this vendor type'
      });
    }

    res.json({
      success: true,
      data: vendorType
    });
  } catch (error) {
    console.error('Get vendor type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new vendor type
// @route   POST /api/vendor-types
// @access  Private/Manager
exports.createVendorType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    // Check if vendor type already exists
    const vendorTypeExists = await VendorType.findOne({ name });
    if (vendorTypeExists) {
      return res.status(400).json({
        success: false,
        message: 'Vendor Type with this name already exists'
      });
    }

    const vendorType = await VendorType.create({
      name,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: vendorType
    });
  } catch (error) {
    console.error('Create vendor type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update vendor type
// @route   PUT /api/vendor-types/:id
// @access  Private/Manager
exports.updateVendorType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let vendorType = await VendorType.findById(req.params.id);

    if (!vendorType) {
      return res.status(404).json({
        success: false,
        message: 'Vendor Type not found'
      });
    }

    // Check if user has access to update this record
    if (req.user.userRole !== 'admin' && vendorType.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vendor type'
      });
    }

    // Don't allow updating name to one that's already in use
    if (req.body.name && req.body.name !== vendorType.name) {
      const nameExists = await VendorType.findOne({ name: req.body.name });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Vendor Type name is already in use'
        });
      }
    }

    const { name } = req.body;
    if (name) vendorType.name = name;

    await vendorType.save();

    res.json({
      success: true,
      data: vendorType
    });
  } catch (error) {
    console.error('Update vendor type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete vendor type
// @route   DELETE /api/vendor-types/:id
// @access  Private/Manager
exports.deleteVendorType = async (req, res) => {
  try {
    const vendorType = await VendorType.findById(req.params.id);

    if (!vendorType) {
      return res.status(404).json({
        success: false,
        message: 'Vendor Type not found'
      });
    }

    // Check if user has access to delete this record
    if (req.user.userRole !== 'admin' && vendorType.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vendor type'
      });
    }

    await vendorType.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete vendor type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};