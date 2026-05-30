-- Migración para mejorar tabla medicamentos con campos de farmacia profesional

-- Agregar nuevas columnas a medicamentos
ALTER TABLE medicamentos ADD COLUMN fecha_vencimiento DATE DEFAULT NULL;
ALTER TABLE medicamentos ADD COLUMN numero_lote VARCHAR(100) DEFAULT NULL;
ALTER TABLE medicamentos ADD COLUMN stock_minimo INT DEFAULT 0;
ALTER TABLE medicamentos ADD COLUMN stock_maximo INT DEFAULT 9999;
ALTER TABLE medicamentos ADD COLUMN presentacion VARCHAR(100) DEFAULT 'unidad';
ALTER TABLE medicamentos ADD COLUMN fabricante VARCHAR(150) DEFAULT NULL;
ALTER TABLE medicamentos ADD COLUMN categoria VARCHAR(100) DEFAULT 'general';
ALTER TABLE medicamentos ADD COLUMN activo BOOLEAN DEFAULT TRUE;
ALTER TABLE medicamentos ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE medicamentos ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_medicamentos_hacienda_id ON medicamentos (hacienda_id);
CREATE INDEX idx_medicamentos_categoria ON medicamentos (categoria);
CREATE INDEX idx_medicamentos_activo ON medicamentos (activo);
CREATE INDEX idx_medicamentos_fecha_vencimiento ON medicamentos (fecha_vencimiento);

-- Crear tabla de historial de medicamentos para auditoría
CREATE TABLE IF NOT EXISTS historial_medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicamento_id INT NOT NULL,
    hacienda_id INT NOT NULL,
    usuario_id INT,
    tipo_movimiento ENUM('crear', 'actualizar', 'eliminar', 'entrada_stock', 'salida_stock') NOT NULL,
    cantidad_anterior INT,
    cantidad_nueva INT,
    cambios_otros JSON,
    descripcion TEXT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (hacienda_id) REFERENCES haciendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_historial_medicamento_id (medicamento_id),
    INDEX idx_historial_hacienda_id (hacienda_id),
    INDEX idx_historial_fecha (fecha_movimiento),
    INDEX idx_historial_tipo (tipo_movimiento)
);

-- Crear tabla de alertas de medicamentos
CREATE TABLE IF NOT EXISTS alertas_medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicamento_id INT NOT NULL,
    hacienda_id INT NOT NULL,
    tipo_alerta ENUM('stock_bajo', 'proximo_vencer', 'vencido') NOT NULL,
    estado ENUM('activa', 'resuelta', 'ignorada') DEFAULT 'activa',
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP NULL,
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (hacienda_id) REFERENCES haciendas(id) ON DELETE CASCADE,
    INDEX idx_alertas_medicamento (medicamento_id),
    INDEX idx_alertas_hacienda (hacienda_id),
    INDEX idx_alertas_estado (estado)
);
