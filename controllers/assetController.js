const { validationResult } = require('express-validator');
const Asset = require('../models/Asset');

exports.getAssets = async (req, res) => {
  try {
    const query = req.user.userRole === 'admin' ? {} : { createdBy: req.user._id };
    const assets = await Asset.find(query)
      .populate('building', 'buildingName')
      .sort('assetName')
      .select('-createdAt -updatedAt -__v');
    res.status(200).json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    console.error('Get assets error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('building', 'buildingName')
      .select('-createdAt -updatedAt -__v');
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    if (req.user.userRole !== 'admin' && asset.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this asset' });
    }
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    console.error('Get asset error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createAsset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      assetName,
      building,
      category,
      description,
      status,
      serialNumber,
      modelNumber,
      manufacturer,
      purchaseDate,
      purchaseCost,
      warrantyExpiryDate,
      assignee,
      assignedTo
    } = req.body;

    const assetExists = await Asset.findOne({ assetName, building });
    if (assetExists) {
      return res.status(400).json({
        success: false,
        message: 'Asset with this name in this building already exists'
      });
    }

    const asset = await Asset.create({
      assetName,
      building,
      category,
      description,
      status,
      serialNumber,
      modelNumber,
      manufacturer,
      purchaseDate,
      purchaseCost,
      warrantyExpiryDate,
      assignee,
      assignedTo,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    console.error('Create asset error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (req.user.userRole !== 'admin' && asset.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this asset' });
    }

    if (req.body.assetName && req.body.building && (req.body.assetName !== asset.assetName || req.body.building !== asset.building.toString())) {
      const assetExists = await Asset.findOne({ assetName: req.body.assetName, building: req.body.building });
      if (assetExists) {
        return res.status(400).json({
          success: false,
          message: 'Asset with this name in this building already exists'
        });
      }
    }

    const {
      assetName,
      building,
      category,
      description,
      status,
      serialNumber,
      modelNumber,
      manufacturer,
      purchaseDate,
      purchaseCost,
      warrantyExpiryDate,
      assignee,
      assignedTo
    } = req.body;

    if (assetName) asset.assetName = assetName;
    if (building) asset.building = building;
    if (category) asset.category = category;
    if (description) asset.description = description;
    if (status) asset.status = status;
    if (serialNumber) asset.serialNumber = serialNumber;
    if (modelNumber) asset.modelNumber = modelNumber;
    if (manufacturer) asset.manufacturer = manufacturer;
    if (purchaseDate) asset.purchaseDate = purchaseDate;
    if (purchaseCost) asset.purchaseCost = purchaseCost;
    if (warrantyExpiryDate) asset.warrantyExpiryDate = warrantyExpiryDate;
    if (assignee) asset.assignee = assignee;
    if (assignedTo) asset.assignedTo = assignedTo;

    await asset.save();

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    console.error('Update asset error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (req.user.userRole !== 'admin' && asset.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this asset' });
    }

    await asset.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete asset error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.getAssetsByBuilding = async (req, res) => {
  try {
    const assets = await Asset.find({ building: req.params.buildingId })
      .populate('building', 'buildingName')
      .sort('assetName')
      .select('-createdAt -updatedAt -__v');
    res.status(200).json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    console.error('Get assets by building error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};