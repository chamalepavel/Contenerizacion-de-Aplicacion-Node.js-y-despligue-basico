const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { updateUserRoleValidator } = require('../middleware/validators');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyToken);
router.use(verifyRole('administrador'));

// Dashboard y estadísticas
router.get('/dashboard/stats', adminController.getDashboardStats);

// Gestión de usuarios
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', updateUserRoleValidator, adminController.updateUserRole);
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus);

// Reportes
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/attendees', adminController.getAttendeesReport);

module.exports = router;
