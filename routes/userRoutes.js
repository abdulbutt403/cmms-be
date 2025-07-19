const express = require('express');
const { check } = require('express-validator');
const { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User creation validation
const userValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('firstName', 'First name is required').notEmpty(),
  check('lastName', 'Last name is required').notEmpty(),
  check('jobTitle', 'Job title is required').optional(),
  check('userRole', 'User role must be technician, manager, or admin')
    .optional()
    .isIn(['technician', 'manager', 'admin']),
  check('phoneNumber', 'Phone number is required').notEmpty(),
  check('alertNotification', 'Alert notification email is required').isEmail(),
];

// User update validation
const updateValidation = [
  check('email', 'Please include a valid email').optional().isEmail(),
  check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
  check('firstName', 'First name is required').optional().notEmpty(),
  check('lastName', 'Last name is required').optional().notEmpty(),
  check('jobTitle', 'Job title is required').optional(),
  check('userRole', 'User role must be technician, manager, or admin')
    .optional()
    .isIn(['technician', 'manager', 'admin']),
  check('phoneNumber', 'Phone number is required').optional(),
  check('alertNotification', 'Alert notification email is required').optional().isEmail(),
];

// Protect all routes
router.use(protect);

// Routes limited to managers and admins
router.get('/', authorize('manager', 'admin'), getUsers);
router.post('/', authorize('manager', 'admin'), userValidation, createUser);

// Routes with ID parameter
router.get('/:id', authorize('manager', 'admin'), getUser);
router.put('/:id', authorize('manager', 'admin'), updateValidation, updateUser);
router.delete('/:id', authorize('manager', 'admin'), deleteUser);

module.exports = router;