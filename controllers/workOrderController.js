
// controllers/workOrderController.js
const { validationResult } = require('express-validator');
const WorkOrder = require('../models/WorkOrder');
const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Get all work orders
// @route   GET /api/workorders
// @access  Private
exports.getWorkOrders = async (req, res) => {
  try {
    let query = {};
    
    // Managers see all work orders they created
    if (req.user.userRole === 'manager') {
      query.submittedBy = req.user._id;
    }
    
    // Technicians only see work orders assigned to them
    if (req.user.userRole === 'technician') {
      // Find teams that this technician is a member of
      const teams = await Team.find({ members: req.user._id });
      const teamIds = teams.map(team => team._id);
      
      query.$or = [
        { assigneeType: 'User', assignedTo: req.user._id },
        { assigneeType: 'Team', assignedTo: { $in: teamIds } }
      ];
    }
    
    // Apply filters if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    if (req.query.building) {
      query.building = req.query.building;
    }
    
    // Populate the assigned entity (user or team) and submitted by user
    const workOrders = await WorkOrder.find(query)
      .populate({
        path: 'assignedTo',
        select: 'firstName lastName name members',
      })
      .populate({
        path: 'submittedBy',
        select: 'firstName lastName'
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: workOrders.length,
      data: workOrders
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single work order
// @route   GET /api/workorders/:id
// @access  Private
exports.getWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate({
        path: 'assignedTo',
        select: 'firstName lastName name members',
        populate: {
          path: 'members',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'submittedBy',
        select: 'firstName lastName'
      });
    
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }
    
    // Check authorization to view this work order
    if (req.user.userRole === 'technician') {
      // Check if assigned directly to this technician
      let isAuthorized = workOrder.assigneeType === 'User' && 
                          workOrder.assignedTo._id.toString() === req.user._id.toString();
      
      // If not directly assigned, check if part of the assigned team
      if (!isAuthorized && workOrder.assigneeType === 'Team') {
        const team = await Team.findById(workOrder.assignedTo._id);
        isAuthorized = team && team.members.includes(req.user._id);
      }
      
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this work order'
        });
      }
    } else if (req.user.userRole === 'manager' && 
               workOrder.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this work order'
      });
    }
    
    res.json({
      success: true,
      data: workOrder
    });
  } catch (error) {
    console.error('Get work order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new work order
// @route   POST /api/workorders
// @access  Private/Manager
exports.createWorkOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title,
      startDate,
      dueDate,
      priority,
      category,
      description,
      building,
      asset,
      assigneeType,
      assignedTo,
      isRecurring,
      recurringWO,
      tasks,
      parts,
      vendor
    } = req.body;

    // Validate assigned entity
    const resolvedAssigneeType = assigneeType === 'Individual' ? 'User' : 'Team';
    const assigneeExists = resolvedAssigneeType === 'User'
      ? await User.findById(assignedTo)
      : await Team.findById(assignedTo);

    if (!assigneeExists) {
      return res.status(400).json({
        success: false,
        message: `${resolvedAssigneeType} with ID ${assignedTo} not found`
      });
    }

    // Build the work order object
    const newWorkOrder = {
      title,
      startDate,
      dueDate,
      priority,
      category,
      description,
      building,
      asset,
      assigneeType: resolvedAssigneeType,
      assignedTo,
      isRecurring: isRecurring === 'true' || isRecurring === true, // if sent as string from form
      recurringWO: recurringWO || null,
      tasks: tasks ? JSON.parse(tasks) : [],
      parts: parts ? JSON.parse(parts) : [],
      vendor,
      submittedBy: req.user._id,
      status: 'Open'
    };

    // Handle photo upload
    if (req.file) {
      newWorkOrder.photoUrl = `/uploads/${req.file.filename}`;
    }

    const workOrder = await WorkOrder.create(newWorkOrder);

    res.status(201).json({
      success: true,
      data: workOrder
    });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Update work order
// @route   PUT /api/workorders/:id
// @access  Private
exports.updateWorkOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    // Role-based auth checks
    if (req.user.userRole === 'manager' && workOrder.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this work order' });
    }

    if (req.user.userRole === 'technician') {
      let isAuthorized = workOrder.assigneeType === 'User' &&
        workOrder.assignedTo.toString() === req.user._id.toString();

      if (!isAuthorized && workOrder.assigneeType === 'Team') {
        const team = await Team.findById(workOrder.assignedTo);
        isAuthorized = team && team.members.includes(req.user._id);
      }

      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this work order' });
      }

      const allowedFields = ['status', 'tasks'];
      const updates = Object.keys(req.body);
      const validOperation = updates.every(field => allowedFields.includes(field));

      if (!validOperation) {
        return res.status(400).json({ success: false, message: 'Technicians can only update status and tasks' });
      }
    }

    // Validate and map assigneeType if needed
    if (req.body.assigneeType && req.body.assignedTo) {
      const newAssigneeType = req.body.assigneeType === 'Individual' ? 'User' : 'Team';
      const assigneeExists = newAssigneeType === 'User'
        ? await User.findById(req.body.assignedTo)
        : await Team.findById(req.body.assignedTo);

      if (!assigneeExists) {
        return res.status(400).json({
          success: false,
          message: `${newAssigneeType} with ID ${req.body.assignedTo} not found`
        });
      }

      req.body.assigneeType = newAssigneeType;
    }

    // Parse arrays if sent as JSON strings
    if (req.body.tasks && typeof req.body.tasks === 'string') {
      req.body.tasks = JSON.parse(req.body.tasks);
    }

    if (req.body.parts && typeof req.body.parts === 'string') {
      req.body.parts = JSON.parse(req.body.parts);
    }

    // Attach uploaded image if exists
    if (req.file) {
      req.body.photoUrl = `/uploads/${req.file.filename}`;
    }

    workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: workOrder });
  } catch (error) {
    console.error('Update work order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Delete work order   
// @route   DELETE /api/workorders/:id
// @access  Private
exports.deleteWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }           

    // Check authorization to delete this work order
    if (req.user.userRole ==='manager' &&
        workOrder.submittedBy.toString()!== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this work order'
      });
    }

    await workOrder.remove();

    res.json({
      success: true,
      data: {}
    });

  }
  catch (error) {
    console.error('Delete work order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}