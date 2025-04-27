-- Configuración de codificación
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Insertar datos de ejemplo en la base de datos
USE lucia_entrenadora_db;

-- Insertar personas
INSERT INTO PERSONA (nombre, apellido, email, telefono, fecha_nacimiento) VALUES
('Lucía', 'Martínez', 'lucia@ejemplo.com', '123456789', '1985-06-15'),
('Juan', 'García', 'juan@ejemplo.com', '987654321', '1990-03-22'),
('María', 'López', 'maria@ejemplo.com', '456789123', '1988-11-05'),
('Carlos', 'Rodríguez', 'carlos@ejemplo.com', '789123456', '1992-07-30'),
('Ana', 'Fernández', 'ana@ejemplo.com', '321654987', '1995-01-18');

-- Insertar entrenadores
INSERT INTO ENTRENADOR (persona_id, especialidad) VALUES
(1, 'Entrenamiento funcional'),
(2, 'Musculación');

-- Insertar clientes
INSERT INTO CLIENTE (persona_id, objetivo) VALUES
(3, 'Pérdida de peso'),
(4, 'Ganancia muscular'),
(5, 'Mejora de rendimiento deportivo');

-- Insertar posiciones
INSERT INTO POSICION (nombre, descripcion) VALUES
('Delantero', 'Posición ofensiva en deportes de equipo'),
('Defensa', 'Posición defensiva en deportes de equipo'),
('Mediocampista', 'Posición central en deportes de equipo');

-- Insertar relaciones cliente-posición
INSERT INTO CLIENTE_POSICION (cliente_id, posicion_id) VALUES
(1, 1),
(2, 2),
(3, 3);

-- Insertar deportes
INSERT INTO DEPORTE (nombre, descripcion) VALUES
('Fútbol', 'Deporte de equipo con balón'),
('Baloncesto', 'Deporte de equipo con canastas'),
('Tenis', 'Deporte de raqueta');

-- Insertar relaciones cliente-deporte
INSERT INTO CLIENTE_DEPORTE (cliente_id, deporte_id) VALUES
(1, 1),
(2, 2),
(3, 3);

-- Insertar rutinas
INSERT INTO RUTINA (nombre, descripcion, fecha_creacion, fecha_modificacion) VALUES
('Rutina principiante', 'Rutina para personas que empiezan a entrenar', '2025-01-15', '2025-02-10'),
('Rutina intermedia', 'Rutina para personas con experiencia media', '2025-02-20', NULL),
('Rutina avanzada', 'Rutina para personas con mucha experiencia', '2025-03-05', NULL);

-- Insertar relaciones cliente-rutina
INSERT INTO CLIENTE_RUTINA (cliente_id, rutina_id, fecha_asignacion, fecha_finalizacion) VALUES
(1, 1, '2025-01-20', NULL),
(2, 2, '2025-02-25', NULL),
(3, 3, '2025-03-10', NULL);

-- Insertar fases
INSERT INTO FASE (nombre, descripcion, duracion) VALUES
('Calentamiento', 'Fase inicial para preparar el cuerpo', '10 minutos'),
('Entrenamiento principal', 'Fase central del entrenamiento', '30 minutos'),
('Enfriamiento', 'Fase final para recuperación', '10 minutos');

-- Insertar días de fase
INSERT INTO DIA_FASE (fase_id, dia) VALUES
(1, 1),
(1, 3),
(1, 5),
(2, 2),
(2, 4),
(3, 6);

-- Insertar ejercicios
INSERT INTO EJERCICIO (nombre, descripcion, categoria, nivel_dificultad, url_video, url_imagen) VALUES
('Sentadillas', 'Ejercicio para piernas y glúteos', 'Piernas', 'Principiante', 'https://ejemplo.com/video1', 'https://ejemplo.com/imagen1'),
('Press de banca', 'Ejercicio para pecho y brazos', 'Pecho', 'Intermedio', 'https://ejemplo.com/video2', 'https://ejemplo.com/imagen2'),
('Dominadas', 'Ejercicio para espalda y brazos', 'Espalda', 'Avanzado', 'https://ejemplo.com/video3', 'https://ejemplo.com/imagen3');

-- Insertar relaciones fase-ejercicio
INSERT INTO FASE_EJERCICIO_REL (fase_id, ejercicio_id, orden, series, tiempo_descanso, notas) VALUES
(1, 1, 1, '3x10', '30 segundos', 'Realizar con peso ligero'),
(2, 2, 1, '4x8', '60 segundos', 'Aumentar peso progresivamente'),
(3, 3, 1, '3x5', '90 segundos', 'Utilizar asistencia si es necesario');

-- Insertar lesiones de clientes
INSERT INTO CLIENTE_LESION (cliente_id, nombre, fecha_inicio, fecha_fin, observaciones) VALUES
(1, 'Esguince de tobillo', '2024-12-10', '2025-01-05', 'Rehabilitación completa'),
(2, 'Tendinitis', '2025-01-15', NULL, 'En tratamiento');

-- Insertar documentos
INSERT INTO DOCUMENTO (cliente_id, nombre, tipo, url_archivo, fecha_subida) VALUES
(1, 'Informe médico', 'PDF', 'https://ejemplo.com/doc1.pdf', '2025-01-10'),
(2, 'Plan nutricional', 'PDF', 'https://ejemplo.com/doc2.pdf', '2025-02-15'),
(3, 'Evaluación física', 'PDF', 'https://ejemplo.com/doc3.pdf', '2025-03-20');
