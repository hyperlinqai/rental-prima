const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/role.controller');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all roles
router.get('/', RoleController.getAllRoles);

// Get role by ID
router.get('/:id', RoleController.getRoleById);

// Create a new role (admin only)
router.post('/', authorizeAdmin, RoleController.createRole);

// Update an existing role (admin only)
router.put('/:id', authorizeAdmin, RoleController.updateRole);

// Delete a role (admin only)
router.delete('/:id', authorizeAdmin, RoleController.deleteRole);

module.exports = router;
