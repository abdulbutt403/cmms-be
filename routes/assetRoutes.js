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
const upload = require('../middleware/multer');

const router = express.Router();

// Asset creation validation
const assetValidation = [
  check('assetName', 'Asset Name is required').notEmpty(),
  check('building', 'Building is required').notEmpty(),
  check('category', 'Category is required').notEmpty(),
  check('status', 'Status is required').isIn(['Active', 'Inactive', 'Retired']),
  check('serialNumber').optional().isString(),
  check('modelNumber').optional().isString(),
  check('manufacturer').optional().isString(),
  check('purchaseDate').optional().isISO8601(),
  check('purchaseCost').optional().isFloat({ min: 0 }),
  check('warrantyExpiryDate').optional().isISO8601(),
  check('assignee').isIn(['User', 'Team']),
  check('assignedTo', 'Assigned To is required').notEmpty()
];

// Asset update validation
const updateValidation = [
  check('assetName').optional().notEmpty(),
  check('building').optional().notEmpty(),
  check('category').optional().notEmpty(),
  check('status').optional().isIn(['Active', 'Inactive', 'Retired']),
  check('serialNumber').optional().isString(),
  check('modelNumber').optional().isString(),
  check('manufacturer').optional().isString(),
  check('purchaseDate').optional().isISO8601(),
  check('purchaseCost').optional().isFloat({ min: 0 }),
  check('warrantyExpiryDate').optional().isISO8601(),
  check('assignee').optional().isIn(['User', 'Team']),
  check('assignedTo').optional().notEmpty()
];

// Protect all routes
router.use(protect);

// Routes limited to managers and admins
router.get('/', authorize('manager', 'admin'), getAssets);
router.post('/', authorize('manager', 'admin'), upload.single('assetPhoto'), assetValidation, createAsset);
router.get('/:id', authorize('manager', 'admin'), getAsset);
router.put('/:id', authorize('manager', 'admin'), upload.single('assetPhoto'), updateValidation, updateAsset);
router.delete('/:id', authorize('manager', 'admin'), deleteAsset);
router.get('/building/:buildingId', authorize('manager', 'admin'), getAssetsByBuilding);

module.exports = router;