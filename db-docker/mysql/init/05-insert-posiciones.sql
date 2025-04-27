-- Configuración de codificación UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- Crear tabla para relacionar deportes y posiciones
CREATE TABLE IF NOT EXISTS DEPORTE_POSICION (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deporte_id INT NOT NULL,
  posicion_id INT NOT NULL,
  FOREIGN KEY (deporte_id) REFERENCES DEPORTE(id),
  FOREIGN KEY (posicion_id) REFERENCES POSICION(id),
  UNIQUE KEY unique_deporte_posicion (deporte_id, posicion_id)
);

-- Insertar posiciones para Fútbol
SET @futbol_id = (SELECT id FROM DEPORTE WHERE nombre = 'Fútbol' LIMIT 1);
INSERT INTO POSICION (nombre, descripcion) VALUES 
('Portero', 'Jugador que defiende la portería'),
('Defensa Central', 'Jugador que defiende en la zona central'),
('Lateral Derecho', 'Defensa del lado derecho'),
('Lateral Izquierdo', 'Defensa del lado izquierdo'),
('Mediocentro', 'Jugador que juega en el centro del campo'),
('Centrocampista Ofensivo', 'Jugador ofensivo en el centro del campo'),
('Extremo Derecho', 'Atacante por la banda derecha'),
('Extremo Izquierdo', 'Atacante por la banda izquierda'),
('Delantero Centro', 'Jugador principal de ataque')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Relacionar posiciones con Fútbol
INSERT INTO DEPORTE_POSICION (deporte_id, posicion_id)
SELECT @futbol_id, id FROM POSICION WHERE nombre IN (
  'Portero', 'Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo',
  'Mediocentro', 'Centrocampista Ofensivo', 'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro'
) ON DUPLICATE KEY UPDATE deporte_id = VALUES(deporte_id);

-- Insertar posiciones para Baloncesto
SET @baloncesto_id = (SELECT id FROM DEPORTE WHERE nombre = 'Baloncesto' LIMIT 1);
INSERT INTO POSICION (nombre, descripcion) VALUES 
('Base', 'Director del juego, posición 1'),
('Escolta', 'Tirador exterior, posición 2'),
('Alero', 'Jugador versátil, posición 3'),
('Ala-Pívot', 'Jugador interior, posición 4'),
('Pívot', 'Jugador más alto, posición 5')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Relacionar posiciones con Baloncesto
INSERT INTO DEPORTE_POSICION (deporte_id, posicion_id)
SELECT @baloncesto_id, id FROM POSICION WHERE nombre IN (
  'Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'
) ON DUPLICATE KEY UPDATE deporte_id = VALUES(deporte_id);

-- Insertar posiciones para Voleibol
SET @voleibol_id = (SELECT id FROM DEPORTE WHERE nombre = 'Voleibol' LIMIT 1);
INSERT INTO POSICION (nombre, descripcion) VALUES 
('Colocador', 'Jugador que coloca el balón para el ataque'),
('Opuesto', 'Jugador principal de ataque'),
('Central', 'Jugador especialista en bloqueo'),
('Receptor', 'Jugador que recibe el saque'),
('Líbero', 'Especialista defensivo')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Relacionar posiciones con Voleibol
INSERT INTO DEPORTE_POSICION (deporte_id, posicion_id)
SELECT @voleibol_id, id FROM POSICION WHERE nombre IN (
  'Colocador', 'Opuesto', 'Central', 'Receptor', 'Líbero'
) ON DUPLICATE KEY UPDATE deporte_id = VALUES(deporte_id);

-- Insertar posiciones para Fútbol Americano
SET @futbol_americano_id = (SELECT id FROM DEPORTE WHERE nombre = 'Fútbol Americano' LIMIT 1);
INSERT INTO POSICION (nombre, descripcion) VALUES 
('Quarterback', 'Líder del ataque, lanza el balón'),
('Running Back', 'Corredor principal'),
('Wide Receiver', 'Receptor abierto'),
('Tight End', 'Receptor y bloqueador'),
('Offensive Line', 'Línea ofensiva, protege al quarterback'),
('Defensive Line', 'Línea defensiva, presiona al quarterback'),
('Linebacker', 'Segunda línea de defensa'),
('Cornerback', 'Defensa contra receptores'),
('Safety', 'Última línea de defensa')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Relacionar posiciones con Fútbol Americano
INSERT INTO DEPORTE_POSICION (deporte_id, posicion_id)
SELECT @futbol_americano_id, id FROM POSICION WHERE nombre IN (
  'Quarterback', 'Running Back', 'Wide Receiver', 'Tight End', 'Offensive Line',
  'Defensive Line', 'Linebacker', 'Cornerback', 'Safety'
) ON DUPLICATE KEY UPDATE deporte_id = VALUES(deporte_id);

-- Insertar posiciones para Béisbol
SET @beisbol_id = (SELECT id FROM DEPORTE WHERE nombre = 'Béisbol' LIMIT 1);
INSERT INTO POSICION (nombre, descripcion) VALUES 
('Pitcher', 'Lanzador'),
('Catcher', 'Receptor'),
('Primera Base', 'Defensor de primera base'),
('Segunda Base', 'Defensor de segunda base'),
('Tercera Base', 'Defensor de tercera base'),
('Shortstop', 'Campocorto'),
('Jardinero Izquierdo', 'Defensor del jardín izquierdo'),
('Jardinero Central', 'Defensor del jardín central'),
('Jardinero Derecho', 'Defensor del jardín derecho')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Relacionar posiciones con Béisbol
INSERT INTO DEPORTE_POSICION (deporte_id, posicion_id)
SELECT @beisbol_id, id FROM POSICION WHERE nombre IN (
  'Pitcher', 'Catcher', 'Primera Base', 'Segunda Base', 'Tercera Base',
  'Shortstop', 'Jardinero Izquierdo', 'Jardinero Central', 'Jardinero Derecho'
) ON DUPLICATE KEY UPDATE deporte_id = VALUES(deporte_id);

-- Insertar posiciones para Rugby
SET @rugby_id = (SELECT id FROM DEPORTE WHERE nombre = 'Rugby' LIMIT 1);
INSERT INTO POSICION (nombre, descripcion) VALUES 
('Pilar', 'Jugador de primera línea'),
('Talonador', 'Jugador central de primera línea'),
('Segunda Línea', 'Jugador alto para ganar balones'),
('Flanker', 'Jugador versátil en defensa y ataque'),
('Número 8', 'Jugador que conecta delanteros y tres cuartos'),
('Medio Melé', 'Distribuidor de juego'),
('Apertura', 'Director de juego'),
('Centro', 'Jugador de ataque y defensa'),
('Ala', 'Jugador rápido para anotar ensayos'),
('Zaguero', 'Última línea de defensa')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Relacionar posiciones con Rugby
INSERT INTO DEPORTE_POSICION (deporte_id, posicion_id)
SELECT @rugby_id, id FROM POSICION WHERE nombre IN (
  'Pilar', 'Talonador', 'Segunda Línea', 'Flanker', 'Número 8',
  'Medio Melé', 'Apertura', 'Centro', 'Ala', 'Zaguero'
) ON DUPLICATE KEY UPDATE deporte_id = VALUES(deporte_id);
