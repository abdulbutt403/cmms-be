const express = require('express');
const { check } = require('express-validator');
const { 
  getAssets, 
  getAsset, 
  createAsset, 
  updateAsset, 
  deleteAsset, 
  getAssetsByBuilding
} = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Asset creation validation
const assetValidation = [
  check('assetName', 'Asset Name is required').notEmpty(),
  check('building', 'Building is required').notEmpty(),
  check('category', 'Category is required').notEmpty(),
  check('status', 'Status is required').isIn(['Active', 'Inactive', 'Retired']),
  check('serialNumber', 'Serial Number must be a string').optional().isString(),
  check('modelNumber', 'Model Number must be a string').optional().isString(),
  check('manufacturer', 'Manufacturer must be a string').optional().isString(),
  check('purchaseDate', 'Purchase Date must be a valid date').optional().isISO8601(),
  check('purchaseCost', 'Purchase Cost must be a positive number').optional().isFloat({ min: 0 }),
  check('warrantyExpiryDate', 'Warranty Expiry Date must be a valid date').optional().isISO8601(),
  check('assignee', 'Assignee type is required').isIn(['User', 'Team']),
  check('assignedTo', 'Assigned To is required').notEmpty()
];

// Asset update validation
const updateValidation = [
  check('assetName', 'Asset Name is required').optional().notEmpty(),
  check('building', 'Building is required').optional().notEmpty(),
  check('category', 'Category is required').optional().notEmpty(),
  check('status', 'Status must be valid').optional().isIn(['Active', 'Inactive', 'Retired']),
  check('serialNumber', 'Serial Number must be a string').optional().isString(),
  check('modelNumber', 'Model Number must be a string').optional().isString(),
  check('manufacturer', 'Manufacturer must be a string').optional().isString(),
  check('purchaseDate', 'Purchase Date must be a valid date').optional().isISO8601(),
  check('purchaseCost', 'Purchase Cost must be a positive number').optional().isFloat({ min: 0 }),
  check('warrantyExpiryDate', 'Warranty Expiry Date must be a valid date').optional().isISO8601(),
  check('assignee', 'Assignee type must be valid').optional().isIn(['User', 'Team']),
  check('assignedTo', 'Assigned To is required').optional().notEmpty()
];

// Protect all routes
router.use(protect);

// Routes limited to managers and admins
router.get('/', authorize('manager', 'admin'), getAssets);

router.post('/', authorize('manager', 'admin'), assetValidation, createAsset);

// Routes with ID parameter
router.get('/:id', authorize('manager', 'admin'), getAsset);
router.put('/:id', authorize('manager', 'admin'), updateValidation, updateAsset);
router.delete('/:id', authorize('manager', 'admin'), deleteAsset);
router.get('/building/:buildingId', authorize('manager', 'admin'), getAssetsByBuilding);



module.exports = router;