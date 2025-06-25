const express = require('express');
const router = express.Router();
const partController = require('../controllers/partsController');
const upload = require('../middleware/multer');

// Routes
router.post('/', upload.single('partPhoto'), partController.createPart);
router.get('/', partController.getAllParts);
router.get('/:id', partController.getPartById);
router.put('/:id', upload.single('partPhoto'), partController.updatePart);
router.delete('/:id', partController.deletePart);

module.exports = router;
