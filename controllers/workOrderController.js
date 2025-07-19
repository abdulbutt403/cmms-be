
// controllers/workOrderController.js
const { validationResult , body} = require('express-validator');
const WorkOrder = require('../models/WorkOrder');
const User = require('../models/User');
const Team = require('../models/Team');
const AssetUsageHistory = require('../models/AssetUsageHistory');
const Part = require('../models/Parts');
const { default: mongoose } = require('mongoose');

// @desc    Get all work orders
// @route   GET /api/workorders
// @access  Private
exports.getWorkOrders = async (req, res) => {
  try {
    let query = {};

    console.log('User Role:', req.user.userRole); // Debug user role
    console.log('User ID:', req.user._id); // Debug user ID

    // Managers see all work orders they created
    if (req.user.userRole === 'manager') {
      query.submittedBy = req.user._id;
      console.log('Manager Query:', query); // Debug manager query
    }
    
    // Technicians only see work orders assigned to them
    if (req.user.userRole === 'technician') {
      const teams = await Team.find({ members: req.user._id });
      const teamIds = teams.map(team => team._id);
      query.$or = [
        { assigneeType: 'User', assignedTo: req.user._id },
        { assigneeType: 'Team', assignedTo: { $in: teamIds } }
      ];
      console.log('Technician Query:', query); // Debug technician query
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
    
    console.log('Final Query:', query); // Debug final query

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


const validateWorkOrder = [
  body("title").trim().notEmpty().withMessage("Work Order Title is required"),
  body("startDate")
    .isISO8601()
    .withMessage("Start Date must be a valid date")
    .notEmpty()
    .withMessage("Start Date is required"),
  body("dueDate")
    .isISO8601()
    .withMessage("Due Date must be a valid date")
    .notEmpty()
    .withMessage("Due Date is required")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("Due Date must be after Start Date");
      }
      return true;
    }),
  body("priority")
    .trim()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High")
    .notEmpty()
    .withMessage("Priority is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  body("building")
    .trim()
    .isMongoId()
    .withMessage("Building must be a valid ID")
    .notEmpty()
    .withMessage("Building is required"),
  body("asset")
    .optional()
    .isMongoId()
    .withMessage("Asset must be a valid ID"),
  body("assigneeType")
    .trim()
    .isIn(["Individual", "Team"])
    .withMessage("Assignee Type must be Individual or Team")
    .notEmpty()
    .withMessage("Assignee Type is required"),
  body("assignedTo")
    .trim()
    .isMongoId()
    .withMessage("Assigned To must be a valid ID")
    .notEmpty()
    .withMessage("Assigned To is required"),
  body("vendor")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Vendor must be a valid ID"),
  body("isRecurring")
    .optional()
    .isBoolean()
    .withMessage("isRecurring must be a boolean"),
 body("recurringWO")
  .optional()
  .trim()
  .custom((value, { req }) => {
    if (req.body.isRecurring && !value) {
      throw new Error("Recurring WO is required when isRecurring is true");
    }
    return true;
  }),
  body("tasks")
    .optional()
    .isArray()
    .withMessage("Tasks must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(
          (task) =>
            task.taskName &&
            typeof task.taskName === "string" &&
            (!task.taskType || typeof task.taskType === "string")
        );
      }
      return true;
    })
    .withMessage("Tasks must be an array of objects with valid taskName and optional taskType"),
  body("parts")
    .optional()
    .isArray({ min: 0 }) // Allow empty array, validate structure later
    .withMessage("Parts must be an array"),
  // Remove the complex parts validation from here, handle it in the controller
];

// @desc    Create new work order
// @route   POST /api/workorders
// @access  Private/Manager
exports.createWorkOrder = [
  validateWorkOrder,
  async (req, res) => {
    console.log("Received request body:", req.body); // Debug: Log the body
    console.log("Received file:", req.file); // Debug: Log the file object

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array()); // Debug: Log validation errors
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
        vendor,
        parts, // Directly use parts from req.body
      } = req.body;

      // Use parts directly if provided, fall back to empty array if undefined
      const parsedParts = Array.isArray(parts) ? parts : [];

      // Validate parts structure
      if (parsedParts.length > 0) {
        const isValid = parsedParts.every(
          (part) =>
            part.partId &&
            typeof part.partId === "string" &&
            mongoose.Types.ObjectId.isValid(part.partId) &&
            !isNaN(parseInt(part.quantity)) &&
            parseInt(part.quantity) > 0
        );
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: "Parts must be an array of objects with valid partId and quantity",
          });
        }
      }

      const assigneeExists = assigneeType === "Individual"
        ? await User.findById(assignedTo)
        : await Team.findById(assignedTo);

      if (!assigneeExists) {
        return res.status(400).json({
          success: false,
          message: `${assigneeType} with ID ${assignedTo} not found`,
        });
      }

      const parsedTasks = tasks ? (typeof tasks === "string" ? JSON.parse(tasks) : tasks) : [];

      const newWorkOrder = {
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
        isRecurring: isRecurring === "true" || isRecurring === true,
        recurringWO: recurringWO || null,
        tasks: parsedTasks,
        parts: parsedParts, // Use parsedParts
        vendor,
        submittedBy: req.user._id,
        status: "Open",
      };

      if (req.file) {
        newWorkOrder.photoUrl = `/uploads/${req.file.filename}`;
      } else {
        console.log("No file uploaded or upload failed");
      }

      const workOrder = await WorkOrder.create(newWorkOrder);

      for (const part of parsedParts) {
        const dbPart = await Part.findById(part.partId);
        if (!dbPart) {
          return res.status(400).json({
            success: false,
            message: `Part with ID ${part.partId} not found`,
          });
        }
        const requestedQuantity = parseInt(part.quantity) || 0;
        if (requestedQuantity > dbPart.availableQuantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient quantity for part ${dbPart.partName}. Available: ${dbPart.availableQuantity}, Requested: ${requestedQuantity}`,
          });
        }
        console.log(`Before update - Part: ${dbPart.partName}, Available: ${dbPart.availableQuantity}, Requested: ${requestedQuantity}`);
        dbPart.availableQuantity -= requestedQuantity;
        if (dbPart.availableQuantity < 0) dbPart.availableQuantity = 0;
        await dbPart.save();
        console.log(`After update - Part: ${dbPart.partName}, New Available: ${dbPart.availableQuantity}`);
      }

      if (asset) {
        await AssetUsageHistory.create({
          workOrderId: workOrder._id,
          assetId: asset,
          description: description,
        });
      }

      res.status(201).json({
        success: true,
        data: workOrder,
      });
    } catch (error) {
      console.error("Create work order error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
];

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

    await workOrder.deleteOne();

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