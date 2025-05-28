const CustomerType = require('../models/CustomerType');

// Create a new customer type
exports.createCustomerType = async (req, res) => {
  try {
    console.log('Creating customer type:', req.body);
    const { name } = req.body;
    const customerType = new CustomerType({ name });
    await customerType.save();
    res.status(201).json({ success: true, data: customerType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all customer types
exports.getAllCustomerTypes = async (req, res) => {
  try {
    const customerTypes = await CustomerType.find();
    res.status(200).json({ success: true, data: customerTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single customer type by ID
exports.getCustomerTypeById = async (req, res) => {
  try {
    const customerType = await CustomerType.findById(req.params.id);
    if (!customerType) {
      return res.status(404).json({ success: false, message: 'Customer type not found' });
    }
    res.status(200).json({ success: true, data: customerType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a customer type
exports.updateCustomerType = async (req, res) => {
  try {
    const customerType = await CustomerType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!customerType) {
      return res.status(404).json({ success: false, message: 'Customer type not found' });
    }
    res.status(200).json({ success: true, data: customerType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a customer type
exports.deleteCustomerType = async (req, res) => {
  try {
    const customerType = await CustomerType.findByIdAndDelete(req.params.id);
    if (!customerType) {
      return res.status(404).json({ success: false, message: 'Customer type not found' });
    }
    res.status(200).json({ success: true, message: 'Customer type deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};