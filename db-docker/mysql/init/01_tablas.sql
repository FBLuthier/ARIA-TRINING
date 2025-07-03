-- =================================================================
-- 01_tablas.sql
-- Creación de las tablas principales de la aplicación.
-- =================================================================

-- Se utiliza `SET_NULL` para las claves foráneas, lo que permite
-- eliminar un rol sin eliminar los usuarios asociados (opcional).

USE `aria_training`;

-- Tabla de Roles (ej: Administrador, Usuario)
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabla de Usuarios
CREATE TABLE `usuarios` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre_usuario` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `contrasena` VARCHAR(255) NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `rol_id` BIGINT UNSIGNED,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- Creación de un índice en la clave foránea para optimizar las consultas
  INDEX `idx_usuarios_rol_id` (`rol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;