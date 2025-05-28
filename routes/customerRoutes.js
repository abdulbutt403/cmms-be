const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Routes for customers
router.post('/', customerController.createCustomer); // Create a customer
router.get('/', customerController.getAllCustomers); // Get all customers
router.get('/:id', customerController.getCustomerById); // Get a customer by ID
router.put('/:id', customerController.updateCustomer); // Update a customer
router.delete('/:id', customerController.deleteCustomer); // Delete a customer

module.exports = router;