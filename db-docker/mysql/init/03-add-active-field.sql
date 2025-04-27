-- Configuración de codificación
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Añadir campo 'activo' a la tabla CLIENTE
ALTER TABLE CLIENTE ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;

-- Actualizar los clientes existentes para que estén activos
UPDATE CLIENTE SET activo = TRUE;
