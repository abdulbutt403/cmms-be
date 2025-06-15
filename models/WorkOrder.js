const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true
  },
  taskType: {
    type: String,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

// Define Part reference instead of nested schema
const PartRefSchema = new mongoose.Schema({
  partId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part', // Reference to the Part model
    required: [true, 'Part ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1
  }
});

const WorkOrderSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  building: { type: String, required: true, trim: true },
  asset: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'On Hold'],
    default: 'Open'
  },
  assigneeType: {
    type: String,
    enum: ['User', 'Team'],
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assigneeType',
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringWO: {
    type: String,
    enum: ['Daily', 'Weekly', 'Every Month', 'Every 3 Months', 'Every 6 Months', 'Every year', null],
    default: null
  },
  photoUrl: {
    type: String,
    default: null
  },
  tasks: [TaskSchema],
  parts: [PartRefSchema], // Use the reference schema
  vendor: {
    type: String,
    trim: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

WorkOrderSchema.virtual('assigneeDetails', {
  refPath: 'assigneeType',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('WorkOrder', WorkOrderSchema);