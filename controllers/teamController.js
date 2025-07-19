const { validationResult } = require('express-validator');
const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private/Manager
exports.getTeams = async (req, res) => {
  try {
    // Managers should only see teams they've created
    const query = { createdBy: req.user._id };
    
    // Allow admins to see all teams
    if (req.user.userRole === 'admin') {
      delete query.createdBy;
    }
    
    const teams = await Team.find(query)
      .populate({
        path: 'members',
        select: 'firstName lastName email jobTitle'
      })
      .sort('name');
    
    res.json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private/Manager
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'members',
        select: 'firstName lastName email jobTitle'
      });
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has access to this team
    if (req.user.userRole !== 'admin' && team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this team'
      });
    }
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private/Manager
exports.createTeam = async (req, res) => {

  console.log('Creating team with body:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { name, members } = req.body;
    
    // Verify all members exist and are technicians
    if (members && members.length > 0) {
      const users = await User.find({ _id: { $in: members } });
      
      if (users.length !== members.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more team members do not exist'
        });
      }
      
      // Check if any non-technicians are being added to the team
      const nonTechnicians = users.filter(user => user.userRole !== 'technician');
      if (nonTechnicians.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Only technicians can be added to teams'
        });
      }
    }
    
    // Create team
    const team = await Team.create({
      name,
      members: members || [],
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private/Manager
exports.updateTeam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    let team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has access to update this team
    if (req.user.userRole !== 'admin' && team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this team'
      });
    }
    
    // Verify all members exist and are technicians
    if (req.body.members && req.body.members.length > 0) {
      const users = await User.find({ _id: { $in: req.body.members } });
      
      if (users.length !== req.body.members.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more team members do not exist'
        });
      }
      
      // Check if any non-technicians are being added to the team
      const nonTechnicians = users.filter(user => user.userRole !== 'technician');
      if (nonTechnicians.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Only technicians can be added to teams'
        });
      }
    }
    
    // Update team
    team = await Team.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private/Manager
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has access to delete this team
    if (req.user.userRole !== 'admin' && team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this team'
      });
    }
    
    await team.deleteOne();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};