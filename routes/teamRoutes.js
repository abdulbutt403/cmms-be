const express = require('express');
const { check } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const teamController = require('../controllers/teamController'); // Import the controller

// Team validation
const teamValidation = [
  check('name', 'Team name is required').notEmpty(),
  check('members', 'Members must be an array of user IDs').isArray(),
  check('members.*', 'Each member must be a valid MongoDB ID').isMongoId()
];

// Team update validation
const updateTeamValidation = [
  check('name', 'Team name is required').optional().notEmpty(),
  check('members', 'Members must be an array of user IDs').optional().isArray(),
  check('members.*', 'Each member must be a valid MongoDB ID').optional().isMongoId()
];

// Protect all routes
router.use(protect);

// Routes limited to managers and admins
router.get('/', authorize('manager', 'admin'), teamController.getTeams); // Use controller function
router.post('/', authorize('manager', 'admin'), teamValidation, teamController.createTeam); // Use controller function

// Routes with ID parameter
router.get('/:id', authorize('manager', 'admin'), teamController.getTeam); // Use controller function
router.put('/:id', authorize('manager', 'admin'), updateTeamValidation, teamController.updateTeam); // Use controller function
router.delete('/:id', authorize('manager', 'admin'), teamController.deleteTeam); // Use controller function

module.exports = router;