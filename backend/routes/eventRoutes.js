const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    createEventValidator,
    updateEventValidator,
    idParamValidator
} = require('../middleware/validators');

// Rutas públicas
router.get('/', eventController.getEvents);
router.get('/:id', idParamValidator, eventController.getEventById);

// Rutas protegidas - requieren autenticación
router.post(
    '/',
    verifyToken,
    verifyRole('organizador', 'administrador'),
    upload.single('imagen'),
    createEventValidator,
    eventController.createEvent
);

router.put(
    '/:id',
    verifyToken,
    verifyRole('organizador', 'administrador'),
    idParamValidator,
    upload.single('imagen'),
    updateEventValidator,
    eventController.updateEvent
);

router.delete(
    '/:id',
    verifyToken,
    verifyRole('organizador', 'administrador'),
    idParamValidator,
    eventController.deleteEvent
);

module.exports = router;
