const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const {
    registerValidator,
    loginValidator,
    updateProfileValidator
} = require('../middleware/validators');

// Rutas públicas
router.post('/register', registerLimiter, registerValidator, authController.register);
router.post('/login', loginLimiter, loginValidator, authController.login);

// Rutas protegidas
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, updateProfileValidator, authController.updateProfile);

module.exports = router;
