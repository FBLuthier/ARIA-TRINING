-- Configuración de codificación UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- Insertar deportes comunes
INSERT INTO DEPORTE (nombre, descripcion) VALUES
('Fútbol', 'Deporte de equipo jugado con un balón entre dos equipos de 11 jugadores'),
('Baloncesto', 'Deporte de equipo jugado con un balón entre dos equipos de 5 jugadores'),
('Voleibol', 'Deporte de equipo jugado con un balón entre dos equipos de 6 jugadores'),
('Tenis', 'Deporte de raqueta jugado entre dos jugadores o dos parejas'),
('Natación', 'Deporte acuático que consiste en el desplazamiento en el agua'),
('Atletismo', 'Conjunto de disciplinas deportivas que incluyen carreras, saltos y lanzamientos'),
('Ciclismo', 'Deporte que implica el uso de la bicicleta'),
('Fútbol Americano', 'Deporte de equipo jugado con un balón ovalado entre dos equipos de 11 jugadores'),
('Rugby', 'Deporte de equipo jugado con un balón ovalado entre dos equipos de 15 jugadores'),
('Béisbol', 'Deporte de equipo jugado con un bate y una pelota entre dos equipos de 9 jugadores'),
('Golf', 'Deporte que consiste en introducir una bola en los hoyos con el menor número de golpes'),
('Hockey', 'Deporte de equipo jugado con un disco o una pelota y un palo'),
('Boxeo', 'Deporte de combate en el que dos personas se enfrentan utilizando únicamente sus puños'),
('Artes Marciales', 'Conjunto de disciplinas físicas y mentales que incluyen karate, judo, taekwondo, etc.'),
('Gimnasia', 'Deporte que consiste en la realización de ejercicios que requieren fuerza, flexibilidad y agilidad'),
('Esquí', 'Deporte de invierno que consiste en deslizarse por la nieve con esquís'),
('Snowboard', 'Deporte de invierno que consiste en deslizarse por la nieve con una tabla'),
('Surf', 'Deporte acuático que consiste en deslizarse sobre las olas con una tabla'),
('Escalada', 'Deporte que consiste en subir paredes de roca o estructuras artificiales'),
('Patinaje', 'Deporte que consiste en deslizarse sobre una superficie con patines')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);
