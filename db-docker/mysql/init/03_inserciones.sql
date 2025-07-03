-- =================================================================
-- 03_inserciones.sql
-- Inserción de datos iniciales para el sistema.
-- =================================================================

USE `aria_training`;

-- Inserción de Roles
INSERT INTO `roles` (`nombre`) VALUES
  ('ADMIN'),
  ('USER');

-- Inserción de Usuarios
-- IMPORTANTE: Las contraseñas aquí están "hasheadas" usando un algoritmo
-- como bcrypt. NUNCA guardes contraseñas en texto plano.
-- La contraseña para ambos usuarios de ejemplo es 'admin123'
INSERT INTO `usuarios` (`nombre_usuario`, `email`, `contrasena`, `rol_id`) VALUES
  ('admin', 'admin@mail.com', '$2a$12$E4/P/k6C2mna451gw4T13e5jA./aW9H31k1T4hRTeoV30o2fJ1k9q', 1),
  ('user', 'user@mail.com', '$2a$12$E4/P/k6C2mna451gw4T13e5jA./aW9H31k1T4hRTeoV30o2fJ1k9q', 2);