const { validationResult } = require('express-validator');
const Building = require('../models/Building');
const Asset = require('../models/Asset');
const Part = require('../models/Parts');

// @desc    Get all buildings
// @route   GET /api/buildings
// @access  Private/Manager
exports.getBuildings = async (req, res) => {
  try {
    const query = { createdBy: req.user._id };

    if (req.user.userRole === 'admin') {
      delete query.createdBy;
    }

    const buildings = await Building.find(query).sort('buildingName');

    res.json({
      success: true,
      count: buildings.length,
      data: buildings
    });
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single building
// @route   GET /api/buildings/:id
// @access  Private/Manager
exports.getBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found'
      });
    }

    if (req.user.userRole !== 'admin' && building.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this building'
      });
    }

    res.json({
      success: true,
      data: building
    });
  } catch (error) {
    console.error('Get building error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new building
// @route   POST /api/buildings
// @access  Private/Manager
exports.createBuilding = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { buildingName, address, contactPerson, contactNumber, email } = req.body;

    const buildingExists = await Building.findOne({ buildingName });
    if (buildingExists) {
      return res.status(400).json({
        success: false,
        message: 'Building with this name already exists'
      });
    }

    const building = await Building.create({
      buildingName,
      address,
      contactPerson,
      contactNumber,
      email,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: building
    });
  } catch (error) {
    console.error('Create building error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update building
// @route   PUT /api/buildings/:id
// @access  Private/Manager
exports.updateBuilding = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found'
      });
    }

    if (req.user.userRole !== 'admin' && building.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this building'
      });
    }

    if (req.body.buildingName && req.body.buildingName !== building.buildingName) {
      const buildingExists = await Building.findOne({ buildingName: req.body.buildingName });
      if (buildingExists) {
        return res.status(400).json({
          success: false,
          message: 'Building name is already in use'
        });
      }
    }

    const { address, contactPerson, contactNumber, email } = req.body;
    if (address) building.address = address;
    if (contactPerson) building.contactPerson = contactPerson;
    if (contactNumber) building.contactNumber = contactNumber;
    if (email) building.email = email;

    await building.save();

    res.json({
      success: true,
      data: building
    });
  } catch (error) {
    console.error('Update building error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete building
// @route   DELETE /api/buildings/:id
// @access  Private/Manager
exports.deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found'
      });
    }

    if (req.user.userRole !== 'admin' && building.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this building'
      });
    }

    // Delete all assets and parts related to this building
    await Asset.deleteMany({ building: building._id });
    await Part.deleteMany({ building: building._id });

    await building.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete building error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};