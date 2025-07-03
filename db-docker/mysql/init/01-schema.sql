-- Configuración de codificación
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Creación de la base de datos
USE lucia_entrenadora_db;

-- Tabla PERSONA
CREATE TABLE PERSONA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    fecha_nacimiento DATE
);

-- Tabla ENTRENADOR
CREATE TABLE ENTRENADOR (
    id INT AUTO_INCREMENT PRIMARY KEY,
    persona_id INT NOT NULL,
    especialidad VARCHAR(100),
    FOREIGN KEY (persona_id) REFERENCES PERSONA(id)
);

-- Tabla CLIENTE
CREATE TABLE CLIENTE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    persona_id INT NOT NULL,
    objetivo VARCHAR(255),
    FOREIGN KEY (persona_id) REFERENCES PERSONA(id)
);

-- Tabla POSICION
CREATE TABLE POSICION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla CLIENTE_POSICION
CREATE TABLE CLIENTE_POSICION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    posicion_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id),
    FOREIGN KEY (posicion_id) REFERENCES POSICION(id)
);

-- Tabla DEPORTE
CREATE TABLE DEPORTE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla CLIENTE_DEPORTE
CREATE TABLE CLIENTE_DEPORTE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    deporte_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id),
    FOREIGN KEY (deporte_id) REFERENCES DEPORTE(id)
);

-- Tabla RUTINA
CREATE TABLE RUTINA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATE NOT NULL,
    fecha_modificacion DATE
);

-- Tabla CLIENTE_RUTINA
CREATE TABLE CLIENTE_RUTINA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    rutina_id INT NOT NULL,
    fecha_asignacion DATE NOT NULL,
    fecha_finalizacion DATE,
    FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id),
    FOREIGN KEY (rutina_id) REFERENCES RUTINA(id)
);

-- Tabla FASE
CREATE TABLE FASE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion VARCHAR(50)
);

-- Tabla DIA_FASE
CREATE TABLE DIA_FASE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fase_id INT NOT NULL,
    dia INT NOT NULL,
    FOREIGN KEY (fase_id) REFERENCES FASE(id)
);

-- Tabla FASE_EJERCICIO_REL
CREATE TABLE FASE_EJERCICIO_REL (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fase_id INT NOT NULL,
    ejercicio_id INT NOT NULL,
    orden INT,
    series VARCHAR(50),
    tiempo_descanso VARCHAR(50),
    notas TEXT,
    FOREIGN KEY (fase_id) REFERENCES FASE(id)
);

-- Tabla CATEGORIA_EJERCICIO
CREATE TABLE CATEGORIA_EJERCICIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla EJERCICIO
CREATE TABLE EJERCICIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    ejecucion TEXT,
    categoria_id INT,
    nivel_dificultad VARCHAR(50),
    url_video VARCHAR(255),
    url_imagen VARCHAR(255),
    FOREIGN KEY (categoria_id) REFERENCES CATEGORIA_EJERCICIO(id)
);

-- Tabla CLIENTE_LESION
CREATE TABLE CLIENTE_LESION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    observaciones TEXT,
    FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id)
);

-- Tabla DOCUMENTO
CREATE TABLE DOCUMENTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    url_archivo VARCHAR(255),
    fecha_subida DATE NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id)
);
