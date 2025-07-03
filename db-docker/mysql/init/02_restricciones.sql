-- =================================================================
-- 02_restricciones.sql
-- Definición de las claves foráneas (constraints).
-- =================================================================

USE `aria_training`;

ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_roles`
  FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;