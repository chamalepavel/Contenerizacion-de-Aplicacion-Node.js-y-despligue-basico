const { body, param, query } = require('express-validator');

// Validadores para autenticación
const registerValidator = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres')
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
];

const updateProfileValidator = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('telefono')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres')
];

// Validadores para eventos
const createEventValidator = [
    body('titulo')
        .trim()
        .notEmpty().withMessage('El título es requerido')
        .isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
    body('descripcion')
        .trim()
        .notEmpty().withMessage('La descripción es requerida')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
    body('fecha_evento')
        .notEmpty().withMessage('La fecha del evento es requerida')
        .isISO8601().withMessage('Debe ser una fecha válida')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('La fecha del evento debe ser futura');
            }
            return true;
        }),
    body('ubicacion')
        .trim()
        .notEmpty().withMessage('La ubicación es requerida')
        .isLength({ max: 255 }).withMessage('La ubicación no puede exceder 255 caracteres'),
    body('capacidad_total')
        .notEmpty().withMessage('La capacidad total es requerida')
        .isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero positivo'),
    body('precio')
        .notEmpty().withMessage('El precio es requerido')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('categoria_id')
        .notEmpty().withMessage('La categoría es requerida')
        .isInt({ min: 1 }).withMessage('Debe ser un ID de categoría válido'),
    body('destacado')
        .optional()
        .isBoolean().withMessage('Destacado debe ser verdadero o falso')
];

const updateEventValidator = [
    body('titulo')
        .trim()
        .notEmpty().withMessage('El título es requerido')
        .isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
    body('descripcion')
        .trim()
        .notEmpty().withMessage('La descripción es requerida')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
    body('fecha_evento')
        .notEmpty().withMessage('La fecha del evento es requerida')
        .isISO8601().withMessage('Debe ser una fecha válida'),
    body('ubicacion')
        .trim()
        .notEmpty().withMessage('La ubicación es requerida')
        .isLength({ max: 255 }).withMessage('La ubicación no puede exceder 255 caracteres'),
    body('capacidad_total')
        .notEmpty().withMessage('La capacidad total es requerida')
        .isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero positivo'),
    body('precio')
        .notEmpty().withMessage('El precio es requerido')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('categoria_id')
        .notEmpty().withMessage('La categoría es requerida')
        .isInt({ min: 1 }).withMessage('Debe ser un ID de categoría válido'),
    body('destacado')
        .optional()
        .isBoolean().withMessage('Destacado debe ser verdadero o falso')
];

// Validadores para boletos
const purchaseTicketValidator = [
    body('evento_id')
        .notEmpty().withMessage('El ID del evento es requerido')
        .isInt({ min: 1 }).withMessage('Debe ser un ID de evento válido'),
    body('cantidad')
        .optional()
        .isInt({ min: 1, max: 10 }).withMessage('La cantidad debe estar entre 1 y 10'),
    body('metodo_pago')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('El método de pago no puede exceder 50 caracteres')
];

// Validadores para categorías
const categoryValidator = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('descripcion')
        .optional()
        .trim()
];

// Validadores para administración
const updateUserRoleValidator = [
    body('rol_id')
        .notEmpty().withMessage('El ID del rol es requerido')
        .isInt({ min: 1 }).withMessage('Debe ser un ID de rol válido')
];

// Validadores de parámetros
const idParamValidator = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const codigoParamValidator = [
    param('codigo')
        .trim()
        .notEmpty().withMessage('El código es requerido')
];

module.exports = {
    registerValidator,
    loginValidator,
    updateProfileValidator,
    createEventValidator,
    updateEventValidator,
    purchaseTicketValidator,
    categoryValidator,
    updateUserRoleValidator,
    idParamValidator,
    codigoParamValidator
};
