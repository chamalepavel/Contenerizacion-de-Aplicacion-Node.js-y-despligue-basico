const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const {
    categoryValidator,
    idParamValidator
} = require('../middleware/validators');

// Rutas públicas
router.get('/', categoryController.getCategories);
router.get('/:id', idParamValidator, categoryController.getCategoryById);

// Rutas protegidas - solo administradores
router.post(
    '/',
    verifyToken,
    verifyRole('administrador'),
    categoryValidator,
    categoryController.createCategory
);

router.put(
    '/:id',
    verifyToken,
    verifyRole('administrador'),
    idParamValidator,
    categoryValidator,
    categoryController.updateCategory
);

router.delete(
    '/:id',
    verifyToken,
    verifyRole('administrador'),
    idParamValidator,
    categoryController.deleteCategory
);

module.exports = router;
