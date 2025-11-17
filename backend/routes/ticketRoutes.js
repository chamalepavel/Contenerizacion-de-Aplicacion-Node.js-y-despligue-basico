const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { purchaseLimiter } = require('../middleware/rateLimiter');
const {
    purchaseTicketValidator,
    idParamValidator,
    codigoParamValidator
} = require('../middleware/validators');

// Rutas protegidas - requieren autenticación
router.post(
    '/purchase',
    verifyToken,
    purchaseLimiter,
    purchaseTicketValidator,
    ticketController.purchaseTicket
);

router.get(
    '/my-tickets',
    verifyToken,
    ticketController.getUserTickets
);

router.get(
    '/code/:codigo',
    verifyToken,
    codigoParamValidator,
    ticketController.getTicketByCode
);

router.delete(
    '/:id',
    verifyToken,
    idParamValidator,
    ticketController.cancelTicket
);

// Ruta para organizadores y administradores
router.put(
    '/mark-used/:codigo',
    verifyToken,
    verifyRole('organizador', 'administrador'),
    codigoParamValidator,
    ticketController.markTicketAsUsed
);

module.exports = router;
