-- Configuración de codificación UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Insertar categorías de ejercicios
-- Usamos IGNORE para que no falle si intentamos insertar una categoría que ya existe por su nombre único.
INSERT IGNORE INTO CATEGORIA_EJERCICIO (nombre) VALUES
('Pecho'),
('Espalda'),
('Hombros'),
('Bíceps'),
('Tríceps'),
('Antebrazos'),
('Cuádriceps'),
('Isquiotibiales'),
('Glúteos'),
('Pantorrillas'),
('Core'),
('Cardio'),
('Potencia'),
('Pliometricos'),
('Otros'),
('Estiramientos');
