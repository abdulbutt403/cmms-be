const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Manager
exports.getUsers = async (req, res) => {
  try {
    // Managers should only see users they've created
    const query = { createdBy: req.user._id };
    
    // Allow admins to see all users
    if (req.user.userRole === 'admin') {
      delete query.createdBy;
    }
    
    const users = await User.find(query).sort('firstName');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Manager
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has access to this record
    if (req.user.userRole !== 'admin' && user.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Manager
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { email, password, firstName, lastName, phoneNumber, alertNotification, jobTitle, userRole } = req.body;

    console.log('Creating user:', {
      email,
      firstName,
      lastName,
      jobTitle,
      userRole
    });
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create user with reference to the manager who created it
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      alertNotification,
      jobTitle,
      userRole: userRole || 'technician',
      createdBy: req.user._id,
      companyName: req.user.companyName  // Inherit company from manager
    });
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Manager
exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has access to update this record
    if (req.user.userRole !== 'admin' && 
        user.createdBy && 
        user.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }
    
    // Don't allow updating email to one that's already in use
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }
    
    // Update fields
    const { firstName, lastName, phoneNumber, alertNotification, jobTitle, userRole, email } = req.body;
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (alertNotification) user.alertNotification = alertNotification;
    if (jobTitle) user.jobTitle = jobTitle;
    if (userRole) user.userRole = userRole;
    if (email) user.email = email;
    
    // If password is provided, it will be hashed by the pre-save hook
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    await user.save();
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Manager
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has access to delete this record
    if (req.user.userRole !== 'admin' && 
        user.createdBy && 
        user.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
