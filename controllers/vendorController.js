const { validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private/Manager
exports.getVendors = async (req, res) => {
  try {
    // Managers should only see vendors they've created
    const query = { createdBy: req.user._id };

    // Allow admins to see all vendors
    if (req.user.userRole === 'admin') {
      delete query.createdBy;
    }

    const vendors = await Vendor.find(query)
      .populate('vendorType', 'name') // Populate vendorType with its name
      .sort('vendorName');

    res.json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private/Manager
exports.getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('vendorType', 'name');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if user has access to this record
    if (req.user.userRole !== 'admin' && vendor.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this vendor'
      });
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private/Manager
exports.createVendor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { vendorName, vendorType, price, address, website, contactName, contactPhone, contactEmail, description } = req.body;

    // Check if vendor already exists
    const vendorExists = await Vendor.findOne({ vendorName });
    if (vendorExists) {
      return res.status(400).json({
        success: false,
        message: 'Vendor with this name already exists'
      });
    }

    const vendor = await Vendor.create({
      vendorName,
      vendorType,
      price,
      address,
      website,
      contactName,
      contactPhone,
      contactEmail,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private/Manager
exports.updateVendor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if user has access to update this record
    if (req.user.userRole !== 'admin' && vendor.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vendor'
      });
    }

    // Don't allow updating vendorName to one that's already in use
    if (req.body.vendorName && req.body.vendorName !== vendor.vendorName) {
      const vendorExists = await Vendor.findOne({ vendorName: req.body.vendorName });
      if (vendorExists) {
        return res.status(400).json({
          success: false,
          message: 'Vendor name is already in use'
        });
      }
    }

    const { vendorType, price, address, website, contactName, contactPhone, contactEmail, description } = req.body;

    if (vendorType) vendor.vendorType = vendorType;
    if (price) vendor.price = price;
    if (address) vendor.address = address;
    if (website) vendor.website = website;
    if (contactName) vendor.contactName = contactName;
    if (contactPhone) vendor.contactPhone = contactPhone;
    if (contactEmail) vendor.contactEmail = contactEmail;
    if (description) vendor.description = description;

    await vendor.save();

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Manager
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if user has access to delete this record
    if (req.user.userRole !== 'admin' && vendor.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vendor'
      });
    }

    await vendor.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};