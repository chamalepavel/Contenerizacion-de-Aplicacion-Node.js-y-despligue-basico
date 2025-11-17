-- Crear base de datos
CREATE DATABASE IF NOT EXISTS evento_platform;
USE evento_platform;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_evento DATETIME NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    capacidad_total INT NOT NULL,
    boletos_disponibles INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    categoria_id INT NOT NULL,
    organizador_id INT NOT NULL,
    imagen VARCHAR(255),
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (organizador_id) REFERENCES usuarios(id)
);

-- Tabla de boletos
CREATE TABLE IF NOT EXISTS boletos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_boleto VARCHAR(50) NOT NULL UNIQUE,
    evento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    precio_pagado DECIMAL(10, 2) NOT NULL,
    estado ENUM('reservado', 'pagado', 'cancelado', 'usado') DEFAULT 'reservado',
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP NULL,
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transacciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    boleto_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50),
    estado ENUM('pendiente', 'completado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boleto_id) REFERENCES boletos(id)
);

-- Insertar roles por defecto
INSERT INTO roles (nombre, descripcion) VALUES
('usuario', 'Usuario regular del sistema'),
('organizador', 'Organizador de eventos'),
('administrador', 'Administrador del sistema');

-- Insertar categorías por defecto
INSERT INTO categorias (nombre, descripcion) VALUES
('Conciertos', 'Eventos musicales y conciertos'),
('Deportes', 'Eventos deportivos'),
('Conferencias', 'Conferencias y seminarios'),
('Teatro', 'Obras de teatro y espectáculos'),
('Festivales', 'Festivales y ferias'),
('Tecnología', 'Eventos de tecnología e innovación');

-- Crear usuario administrador por defecto (password: admin123)
-- Hash generado con bcrypt para 'admin123'
INSERT INTO usuarios (nombre, email, password, telefono, rol_id) VALUES
('Administrador', 'admin@evento.com', '$2a$10$rOZxq8qVGKxUOuFQhqU5/.VGqVKqYqYqYqYqYqYqYqYqYqYqYqYqY', '12345678', 3);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX idx_eventos_categoria ON eventos(categoria_id);
CREATE INDEX idx_eventos_destacado ON eventos(destacado);
CREATE INDEX idx_boletos_usuario ON boletos(usuario_id);
CREATE INDEX idx_boletos_evento ON boletos(evento_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
