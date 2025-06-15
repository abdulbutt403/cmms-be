const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');

const {
  getWorkOrders,
  getWorkOrder,
  createWorkOrder,
  updateWorkOrder
} = require('../controllers/workOrderController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// === Multer config for image upload ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists or create it
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file format'), false);
};

const upload = require('../middleware/multer')

// === Work order validation ===
const recurringOptions = ['Daily', 'Weekly', 'Every Month', 'Every 3 Months', 'Every 6 Months', 'Every year'];

const workOrderValidation = [
  check('title', 'Title is required').notEmpty(),
  check('startDate', 'Start date is required').notEmpty().isISO8601().toDate(),
  check('dueDate', 'Due date is required').notEmpty().isISO8601().toDate(),
  check('priority').optional().isIn(['Low', 'Medium', 'High']),
  check('category', 'Category is required').notEmpty(),
  check('description', 'Description is required').notEmpty(),
  check('building', 'Building is required').notEmpty(),
  check('asset', 'Asset is required').notEmpty(),
  check('assigneeType').notEmpty().isIn(['Individual', 'Team']),
  check('assignedTo', 'Assigned to ID is required').notEmpty().isMongoId(),
  check('isRecurring').optional().isBoolean(),
  check('recurringWO').optional().isIn(recurringOptions),
  check('tasks').optional().isArray(),
  check('parts').optional().isArray()
];

const updateWorkOrderValidation = [
  check('title').optional().notEmpty(),
  check('startDate').optional().isISO8601().toDate(),
  check('dueDate').optional().isISO8601().toDate(),
  check('priority').optional().isIn(['Low', 'Medium', 'High']),
  check('category').optional().notEmpty(),
  check('description').optional().notEmpty(),
  check('building').optional().notEmpty(),
  check('asset').optional().notEmpty(),
  check('assigneeType').optional().isIn(['Individual', 'Team']),
  check('assignedTo').optional().isMongoId(),
  check('status').optional().isIn(['Open', 'In Progress', 'Completed', 'On Hold']),
  check('isRecurring').optional().isBoolean(),
  check('recurringWO').optional().isIn(recurringOptions),
  check('tasks').optional().isArray(),
  check('parts').optional().isArray()
];

// === Routes ===
router.use(protect);

router.get('/', getWorkOrders);
router.get('/:id', getWorkOrder);

router.post(
  '/',
  authorize('manager', 'admin'),
  upload.single('photo'), // image field name = photo
  workOrderValidation,
  createWorkOrder
);

router.put(
  '/:id',
  authorize('manager', 'admin'),
  upload.single('photo'), // optional on update
  updateWorkOrderValidation,
  updateWorkOrder
);

module.exports = router;
