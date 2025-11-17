
const express = require('express');
const router = express.Router();
const {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} = require('../controllers/adminController');

router.post('/create', createAdmin);        // Create a new admin
router.get('/get', getAllAdmins);         // Get all admins
router.get('/:id', getAdminById);     // Get a specific admin by ID
router.put('/:id', updateAdmin);      // Update an admin by ID
router.delete('/:id', deleteAdmin);   // Delete an admin by ID

module.exports = router;