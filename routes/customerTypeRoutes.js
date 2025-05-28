const express = require('express');
const router = express.Router();
const customerTypeController = require('../controllers/customerTypeController');

// Routes for customer types
router.post('/', customerTypeController.createCustomerType); // Create a customer type
router.get('/', customerTypeController.getAllCustomerTypes); // Get all customer types
router.get('/:id', customerTypeController.getCustomerTypeById); // Get a customer type by ID
router.put('/:id', customerTypeController.updateCustomerType); // Update a customer type
router.delete('/:id', customerTypeController.deleteCustomerType); // Delete a customer type

module.exports = router;