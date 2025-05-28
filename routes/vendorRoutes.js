const express = require('express');
const { check } = require('express-validator');
const { 
  getVendors, 
  getVendor, 
  createVendor, 
  updateVendor, 
  deleteVendor 
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Vendor creation validation
const vendorValidation = [
  check('vendorName', 'Vendor Name is required').notEmpty(),
  check('vendorType', 'Vendor Type is required').notEmpty(),
  check('price', 'Price is required and must be a number').isNumeric().notEmpty(),
  check('address', 'Address is required').notEmpty(),
  check('website', 'Please enter a valid website URL').matches(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/),
  check('contactName', 'Contact Name is required').notEmpty(),
  check('contactPhone', 'Please enter a valid phone number').matches(/^\+?[\d\s-]{10,}$/),
  check('contactEmail', 'Please include a valid email').isEmail(),
  check('description', 'Description is required').notEmpty()
];

// Vendor update validation
const updateValidation = [
  check('vendorName', 'Vendor Name is required').optional().notEmpty(),
  check('vendorType', 'Vendor Type is required').optional().notEmpty(),
  check('price', 'Price must be a number').optional().isNumeric(),
  check('address', 'Address is required').optional().notEmpty(),
  check('website', 'Please enter a valid website URL').optional().matches(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/),
  check('contactName', 'Contact Name is required').optional().notEmpty(),
  check('contactPhone', 'Please enter a valid phone number').optional().matches(/^\+?[\d\s-]{10,}$/),
  check('contactEmail', 'Please include a valid email').optional().isEmail(),
  check('description', 'Description is required').optional().notEmpty()
];

// Protect all routes
router.use(protect);

// Routes limited to managers and admins
router.get('/', authorize('manager', 'admin'), getVendors);
router.post('/', authorize('manager', 'admin'), vendorValidation, createVendor);

// Routes with ID parameter
router.get('/:id', authorize('manager', 'admin'), getVendor);
router.put('/:id', authorize('manager', 'admin'), updateValidation, updateVendor);
router.delete('/:id', authorize('manager', 'admin'), deleteVendor);

module.exports = router;