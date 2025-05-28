const express = require('express');
const { check } = require('express-validator');
const { 
  getVendorTypes, 
  getVendorType, 
  createVendorType, 
  updateVendorType, 
  deleteVendorType 
} = require('../controllers/vendorTypeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Vendor Type creation validation
const vendorTypeValidation = [
  check('name', 'Vendor Type Name is required').notEmpty()
];

// Vendor Type update validation
const updateValidation = [
  check('name', 'Vendor Type Name is required').optional().notEmpty()
];

// Protect all routes
router.use(protect);

// Routes limited to managers and admins
router.get('/', authorize('manager', 'admin'), getVendorTypes);
router.post('/', authorize('manager', 'admin'), vendorTypeValidation, createVendorType);

// Routes with ID parameter
router.get('/:id', authorize('manager', 'admin'), getVendorType);
router.put('/:id', authorize('manager', 'admin'), updateValidation, updateVendorType);
router.delete('/:id', authorize('manager', 'admin'), deleteVendorType);

module.exports = router;