const express = require('express');
const { check } = require('express-validator');
const { 
  getBuildings, 
  getBuilding, 
  createBuilding, 
  updateBuilding, 
  deleteBuilding 
} = require('../controllers/buildingContoller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Building creation validation
const buildingValidation = [
  check('buildingName', 'Building Name is required').notEmpty(),
  check('address', 'Address is required').notEmpty(),
  check('contactPerson', 'Contact Person is required').notEmpty(),
  check('contactNumber', 'Please enter a valid phone number').matches(/^\+?[\d\s-]{10,}$/),
  check('email', 'Please include a valid email').isEmail()
];

// Building update validation
const updateValidation = [
  check('buildingName', 'Building Name is required').optional().notEmpty(),
  check('address', 'Address is required').optional().notEmpty(),
  check('contactPerson', 'Contact Person is required').optional().notEmpty(),
  check('contactNumber', 'Please enter a valid phone number').optional().matches(/^\+?[\d\s-]{10,}$/),
  check('email', 'Please include a valid email').optional().isEmail()
];

// Protect all routes
router.use(protect);

// Routes limited to managers and admins
router.get('/', authorize('manager', 'admin'), getBuildings);
router.post('/', authorize('manager', 'admin'), buildingValidation, createBuilding);

// Routes with ID parameter
router.get('/:id', authorize('manager', 'admin'), getBuilding);
router.put('/:id', authorize('manager', 'admin'), updateValidation, updateBuilding);
router.delete('/:id', authorize('manager', 'admin'), deleteBuilding);

module.exports = router;