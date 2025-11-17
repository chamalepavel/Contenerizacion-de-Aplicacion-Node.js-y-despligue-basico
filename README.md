 Plataforma de Gestión de Eventos y Boletos

Proyecto Final - Desarrollo Web Full Stack con Node.js y React
 Estructura del Proyecto

```
evento-platform/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── ticketController.js
│   │   ├── categoryController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validators.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── adminRoutes.js
│   ├── database/
│   │   └── schema.sql
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── EventDetail.js
    │   │   ├── MyTickets.js
    │   │   └── AdminDashboard.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── config/
    │   │   └── api.js
    │   ├── App.js
    │   └── styles.css
    └── package.json
```


