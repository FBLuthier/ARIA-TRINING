const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS específica para Angular en puerto 4200
app.use((req, res, next) => {
  // Permitir solo las solicitudes desde la aplicación Angular en puerto 4200
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Manejar las solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// También usar el middleware cors() como capa adicional de seguridad
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para establecer encabezados de codificación UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'lucia_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear un pool de conexiones
const pool = mysql.createPool(dbConfig);

// Obtener una conexión del pool para uso global
let connection;

// Función para inicializar la base de datos con datos de ejemplo
async function inicializarBaseDeDatos() {
  try {
    // Obtener una conexión del pool
    connection = await pool.getConnection();
    
    console.log('Verificando si la tabla DEPORTE tiene datos...');
    
    // Verificar si ya hay deportes en la tabla
    const [deportes] = await connection.execute('SELECT COUNT(*) as count FROM DEPORTE');
    
    if (deportes[0].count > 0) {
      console.log(`La tabla DEPORTE ya contiene ${deportes[0].count} registros.`);
      connection.release(); // Liberar la conexión
      return;
    }
    
    console.log('La tabla DEPORTE está vacía. Insertando deportes de ejemplo...');
    
    // Insertar deportes de ejemplo
    const deportesEjemplo = [
      ['Fútbol', 'Deporte de equipo jugado con un balón entre dos equipos de 11 jugadores'],
      ['Baloncesto', 'Deporte de equipo jugado con un balón entre dos equipos de 5 jugadores'],
      ['Voleibol', 'Deporte de equipo jugado con un balón entre dos equipos de 6 jugadores'],
      ['Tenis', 'Deporte de raqueta jugado entre dos jugadores o dos parejas'],
      ['Natación', 'Deporte acuático que consiste en el desplazamiento en el agua'],
      ['Atletismo', 'Conjunto de disciplinas deportivas que incluyen carreras, saltos y lanzamientos'],
      ['Ciclismo', 'Deporte que implica el uso de la bicicleta'],
      ['Fútbol Americano', 'Deporte de equipo jugado con un balón ovalado entre dos equipos de 11 jugadores']
    ];
    
    // Insertar cada deporte
    for (const [nombre, descripcion] of deportesEjemplo) {
      await connection.execute(
        'INSERT INTO DEPORTE (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion]
      );
    }
    
    // Verificar cuántos deportes se insertaron
    const [deportesInsertados] = await connection.execute('SELECT COUNT(*) as count FROM DEPORTE');
    console.log(`Se insertaron ${deportesInsertados[0].count} deportes de ejemplo.`);
    
    connection.release(); // Liberar la conexión
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    if (connection) {
      connection.release(); // Asegurarse de liberar la conexión en caso de error
    }
  }
}

// Función para inicializar la tabla POSICION y crear posiciones de ejemplo
async function inicializarTablaPosicion() {
  let conn;
  try {
    console.log('Verificando si la tabla POSICION existe...');
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Verificar si la tabla POSICION existe
    try {
      await conn.execute('SELECT 1 FROM POSICION LIMIT 1');
      console.log('La tabla POSICION ya existe');
      
      // Verificar si la tabla POSICION tiene la columna deporte_id
      try {
        await conn.execute('SELECT deporte_id FROM POSICION LIMIT 1');
        console.log('La tabla POSICION ya tiene la columna deporte_id');
      } catch (error) {
        // Si la columna no existe, agregarla
        console.log('La tabla POSICION no tiene la columna deporte_id. Agregándola...');
        
        await conn.execute(`
          ALTER TABLE POSICION 
          ADD COLUMN deporte_id INT,
          ADD CONSTRAINT fk_posicion_deporte FOREIGN KEY (deporte_id) REFERENCES DEPORTE(id)
        `);
        
        console.log('Columna deporte_id agregada correctamente a la tabla POSICION');
      }
    } catch (error) {
      // Si la tabla no existe, crearla
      console.log('La tabla POSICION no existe. Creándola...');
      
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS POSICION (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT,
          deporte_id INT,
          FOREIGN KEY (deporte_id) REFERENCES DEPORTE(id)
        )
      `);
      
      console.log('Tabla POSICION creada correctamente');
    }
    
    // Verificar si ya hay posiciones en la tabla
    const [posiciones] = await conn.execute('SELECT COUNT(*) as count FROM POSICION');
    
    if (posiciones[0].count > 0) {
      console.log(`La tabla POSICION ya contiene ${posiciones[0].count} registros.`);
      return;
    }
    
    console.log('La tabla POSICION está vacía. Insertando posiciones de ejemplo...');
    
    // Obtener todos los deportes
    const [deportes] = await conn.execute('SELECT * FROM DEPORTE');
    
    // Posiciones de ejemplo para cada deporte
    const posicionesEjemplo = {
      'Fútbol': [
        ['Delantero', 'Posición ofensiva en deportes de equipo'],
        ['Defensa', 'Posición defensiva en deportes de equipo'],
        ['Portero', 'Posición que defiende la portería'],
        ['Mediocampista', 'Posición en el centro del campo']
      ],
      'Baloncesto': [
        ['Base', 'Dirige el juego ofensivo'],
        ['Escolta', 'Especialista en tiro exterior'],
        ['Alero', 'Jugador versátil en ataque y defensa'],
        ['Ala-Pívot', 'Jugador alto con habilidades de tiro'],
        ['Pívot', 'Jugador alto que juega cerca del aro']
      ],
      'Voleibol': [
        ['Colocador', 'Distribuye el juego'],
        ['Opuesto', 'Principal atacante'],
        ['Central', 'Especialista en bloqueo'],
        ['Receptor', 'Recibe el saque y ataca'],
        ['Líbero', 'Especialista en defensa']
      ],
      'Tenis': [
        ['Individual', 'Juego uno contra uno'],
        ['Dobles', 'Juego en parejas']
      ]
    };
    
    // Insertar posiciones para cada deporte
    for (const deporte of deportes) {
      const posicionesDeporte = posicionesEjemplo[deporte.nombre] || [];
      
      for (const [nombre, descripcion] of posicionesDeporte) {
        await conn.execute(
          'INSERT INTO POSICION (nombre, descripcion, deporte_id) VALUES (?, ?, ?)',
          [nombre, descripcion, deporte.id]
        );
      }
    }
    
    // Verificar cuántas posiciones se insertaron
    const [posicionesInsertadas] = await conn.execute('SELECT COUNT(*) as count FROM POSICION');
    console.log(`Se insertaron ${posicionesInsertadas[0].count} posiciones de ejemplo.`);
    
  } catch (error) {
    console.error('Error al inicializar la tabla POSICION:', error);
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
}

// Función para actualizar las posiciones existentes con el deporte correcto
async function actualizarPosicionesExistentes() {
  let conn;
  try {
    console.log('Actualizando posiciones existentes con el deporte correcto...');
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Obtener todos los deportes
    const [deportes] = await conn.execute('SELECT * FROM DEPORTE');
    
    // Mapeo de nombres de posiciones a deportes
    const mapeoDeportes = {
      'Delantero': 'Fútbol',
      'Defensa': 'Fútbol',
      'Portero': 'Fútbol',
      'Mediocampista': 'Fútbol',
      'Base': 'Baloncesto',
      'Escolta': 'Baloncesto',
      'Alero': 'Baloncesto',
      'Ala-Pívot': 'Baloncesto',
      'Pívot': 'Baloncesto',
      'Colocador': 'Voleibol',
      'Opuesto': 'Voleibol',
      'Central': 'Voleibol',
      'Receptor': 'Voleibol',
      'Líbero': 'Voleibol',
      'Individual': 'Tenis',
      'Dobles': 'Tenis'
    };
    
    // Obtener todas las posiciones
    const [posiciones] = await conn.execute('SELECT * FROM POSICION');
    
    // Contador de posiciones actualizadas
    let posicionesActualizadas = 0;
    
    // Actualizar cada posición con el deporte correcto
    for (const posicion of posiciones) {
      // Verificar si la posición ya tiene un deporte_id
      if (posicion.deporte_id) {
        console.log(`La posición ${posicion.nombre} (ID: ${posicion.id}) ya tiene un deporte_id: ${posicion.deporte_id}`);
        continue;
      }
      
      const nombreDeporte = mapeoDeportes[posicion.nombre];
      
      if (nombreDeporte) {
        // Buscar el deporte por nombre
        const deporte = deportes.find(d => d.nombre === nombreDeporte);
        
        if (deporte) {
          // Actualizar la posición con el deporte_id correcto
          await conn.execute(
            'UPDATE POSICION SET deporte_id = ? WHERE id = ?',
            [deporte.id, posicion.id]
          );
          
          console.log(`Posición ${posicion.nombre} (ID: ${posicion.id}) actualizada con deporte_id: ${deporte.id} (${deporte.nombre})`);
          posicionesActualizadas++;
        }
      }
    }
    
    console.log(`Se actualizaron ${posicionesActualizadas} posiciones con el deporte correcto.`);
    
  } catch (error) {
    console.error('Error al actualizar posiciones:', error);
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
}

// Función para simular que algunas posiciones están siendo utilizadas por usuarios
async function simularPosicionesEnUso() {
  let conn;
  try {
    console.log('Simulando posiciones en uso...');
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Crear una tabla temporal para simular usuarios que usan posiciones
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS POSICIONES_EN_USO (
        id INT PRIMARY KEY AUTO_INCREMENT,
        posicion_id INT,
        usuario_nombre VARCHAR(100),
        FOREIGN KEY (posicion_id) REFERENCES POSICION(id)
      )
    `);
    
    // Verificar si ya hay registros en la tabla
    const [registros] = await conn.execute('SELECT COUNT(*) as count FROM POSICIONES_EN_USO');
    
    if (registros[0].count === 0) {
      // Obtener las posiciones "Alero" y "Base"
      const [posiciones] = await conn.execute('SELECT * FROM POSICION WHERE nombre IN ("Alero", "Base")');
      
      // Insertar registros para simular que estas posiciones están en uso
      for (const posicion of posiciones) {
        await conn.execute(
          'INSERT INTO POSICIONES_EN_USO (posicion_id, usuario_nombre) VALUES (?, ?)',
          [posicion.id, `Usuario de prueba para ${posicion.nombre}`]
        );
        console.log(`Simulado que la posición ${posicion.nombre} (ID: ${posicion.id}) está siendo utilizada por un usuario`);
      }
    } else {
      console.log(`Ya existen ${registros[0].count} registros en la tabla POSICIONES_EN_USO`);
    }
  } catch (error) {
    console.error('Error al simular posiciones en uso:', error);
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
}

// Inicializar la conexión global al iniciar el servidor
(async () => {
  try {
    connection = await pool.getConnection();
    console.log('Conexión a la base de datos establecida correctamente');
    
    // Inicializar la base de datos
    await inicializarBaseDeDatos();
    
    // Inicializar la tabla POSICION
    await inicializarTablaPosicion();
    
    // Actualizar las posiciones existentes con el deporte correcto
    await actualizarPosicionesExistentes();
    
    // Simular posiciones en uso
    await simularPosicionesEnUso();
  } catch (error) {
    console.error('Error al establecer la conexión a la base de datos:', error);
  }
})();

// Ruta de prueba para verificar la conexión a la base de datos
app.get('/api/test-connection', async (req, res) => {
  let connection;
  try {
    // Intentar conectar a la base de datos
    connection = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await connection.execute('SET NAMES utf8mb4');
    
    // Ejecutar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as connection_test');
    
    // Si llegamos aquí, la conexión fue exitosa
    res.json({
      success: true,
      message: 'Conexión a la base de datos establecida correctamente',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al conectar a la base de datos',
      error: error.message
    });
  } finally {
    // Cerrar la conexión si se estableció
    if (connection) {
      await connection.release();
    }
  }
});

// Ruta para obtener todos los entrenadores
app.get('/api/entrenadores', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await connection.execute('SET NAMES utf8mb4');
    
    const [rows] = await connection.execute(`
      SELECT e.id, p.nombre, p.apellido, p.email, p.telefono, e.especialidad
      FROM ENTRENADOR e
      JOIN PERSONA p ON e.persona_id = p.id
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener entrenadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener entrenadores',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
});

// Ruta para obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await connection.execute('SET NAMES utf8mb4');
    
    const [rows] = await connection.execute(`
      SELECT c.id, p.nombre, p.apellido, p.email, p.telefono, c.objetivo
      FROM CLIENTE c
      JOIN PERSONA p ON c.persona_id = p.id
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
});

// Ruta para obtener todos los usuarios (clientes)
app.get('/api/usuarios', async (req, res) => {
  let connection;
  try {
    console.log('Solicitud recibida en GET /api/usuarios');
    
    // Crear conexión a la base de datos
    connection = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await connection.execute('SET NAMES utf8mb4');
    
    // Consulta para obtener todos los clientes con sus datos personales
    const [rows] = await connection.execute(`
      SELECT 
        c.id AS cliente_id,
        p.id AS persona_id,
        p.nombre,
        p.apellido,
        p.email,
        p.telefono,
        p.fecha_nacimiento,
        c.objetivo AS programa,
        c.activo
      FROM 
        CLIENTE c
      JOIN 
        PERSONA p ON c.persona_id = p.id
      WHERE
        c.activo = TRUE
      ORDER BY 
        c.id DESC
    `);
    
    // Transformar los datos para que coincidan con el formato esperado por el frontend
    const usuarios = [];
    
    for (const row of rows) {
      // Dividir el nombre en primer y segundo nombre (si existe)
      const nombreParts = row.nombre.split(' ');
      const primerNombre = nombreParts[0];
      const segundoNombre = nombreParts.length > 1 ? nombreParts.slice(1).join(' ') : '';
      
      // Dividir el apellido en primer y segundo apellido (si existe)
      const apellidoParts = row.apellido.split(' ');
      const primerApellido = apellidoParts[0];
      const segundoApellido = apellidoParts.length > 1 ? apellidoParts.slice(1).join(' ') : '';
      
      // Obtener el deporte del cliente
      const [deporteRows] = await connection.execute(`
        SELECT d.nombre
        FROM CLIENTE_DEPORTE cd
        JOIN DEPORTE d ON cd.deporte_id = d.id
        WHERE cd.cliente_id = ?
      `, [row.cliente_id]);
      
      const deporte = deporteRows.length > 0 ? deporteRows[0].nombre : '';
      
      // Obtener la posición del cliente
      const [posicionRows] = await connection.execute(`
        SELECT p.nombre
        FROM CLIENTE_POSICION cp
        JOIN POSICION p ON cp.posicion_id = p.id
        WHERE cp.cliente_id = ?
      `, [row.cliente_id]);
      
      const posicion = posicionRows.length > 0 ? posicionRows[0].nombre : '';
      
      // Obtener las lesiones del cliente
      const [lesionesRows] = await connection.execute(`
        SELECT nombre
        FROM CLIENTE_LESION
        WHERE cliente_id = ?
      `, [row.cliente_id]);
      
      const lesiones = lesionesRows.length > 0 ? lesionesRows[0].nombre : 'Ninguna';
      
      usuarios.push({
        id: row.cliente_id,
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        telefono: row.telefono,
        email: row.email,
        dob: row.fecha_nacimiento,
        programa: row.programa,
        deporte,
        posicion,
        lesiones,
        tieneRutina: false, // Por defecto, asumimos que no tiene rutina
        tieneHistorialRutinas: false, // Por defecto, asumimos que no tiene historial
        documentos: {
          contrato: '',
          consentimiento: '',
          motivacion: '',
          evaluacion: '',
          otros: ''
        },
        mostrarDetalles: false
      });
    }
    
    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  } finally {
    // Cerrar la conexión si se estableció
    if (connection) {
      await connection.release();
      console.log('Conexión cerrada');
    }
  }
});

// Ruta para crear un nuevo usuario (cliente)
app.post('/api/usuarios', async (req, res) => {
  let connection;
  try {
    // Log para depuración
    console.log('Solicitud recibida en /api/usuarios:');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body:', JSON.stringify(req.body));
    
    // Obtener los datos del usuario del cuerpo de la solicitud
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      telefono,
      email,
      programa,
      deporte,
      posicion,
      lesiones,
      dob
    } = req.body;
    
    console.log('Datos extraídos del cuerpo de la solicitud:');
    console.log({
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      telefono,
      email,
      programa,
      deporte,
      posicion,
      lesiones,
      dob
    });
    
    // Validar campos obligatorios
    if (!primerNombre || !primerApellido || !telefono || !email || !programa || !dob) {
      console.log('Error: Faltan campos obligatorios');
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    // Crear conexión a la base de datos
    console.log('Creando conexión a la base de datos...');
    connection = await pool.getConnection();
    
    console.log('Configurando la conexión para usar UTF-8...');
    // Configurar la conexión para usar UTF-8
    await connection.execute('SET NAMES utf8mb4');
    
    console.log('Iniciando transacción...');
    // Iniciar transacción
    await connection.beginTransaction();

    // Verificar si el email ya existe
    console.log('Verificando si el email ya existe...');
    
    // Obtener una conexión del pool
    const [emailExists] = await connection.execute(
      `SELECT id FROM PERSONA WHERE email = ?`,
      [email]
    );

    if (emailExists.length > 0) {
      console.log('El email ya existe en la base de datos');
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este correo electrónico',
        error: 'EMAIL_EXISTS'
      });
    }

    // 1. Insertar en la tabla PERSONA
    const nombreCompleto = segundoNombre 
      ? `${primerNombre} ${segundoNombre}` 
      : primerNombre;
    
    const apellidoCompleto = segundoApellido 
      ? `${primerApellido} ${segundoApellido}` 
      : primerApellido;

    console.log('Insertando en la tabla PERSONA...');
    console.log('Nombre completo:', nombreCompleto);
    console.log('Apellido completo:', apellidoCompleto);
    
    const [personaResult] = await connection.execute(
      `INSERT INTO PERSONA (nombre, apellido, email, telefono, fecha_nacimiento) 
       VALUES (?, ?, ?, ?, ?)`,
      [nombreCompleto, apellidoCompleto, email, telefono, dob]
    );

    const personaId = personaResult.insertId;
    console.log('Persona creada con ID:', personaId);

    // 2. Insertar en la tabla CLIENTE
    console.log('Insertando en la tabla CLIENTE...');
    console.log('Programa/objetivo:', programa);
    
    const [clienteResult] = await connection.execute(
      `INSERT INTO CLIENTE (persona_id, objetivo) 
       VALUES (?, ?)`,
      [personaId, programa]
    );

    const clienteId = clienteResult.insertId;
    console.log('Cliente creado con ID:', clienteId);

    // 3. Si se proporciona un deporte, insertarlo o relacionarlo
    if (deporte) {
      console.log('Procesando deporte:', deporte);
      
      // Verificar si el deporte ya existe
      const [deportes] = await connection.execute(
        `SELECT id FROM DEPORTE WHERE nombre = ?`,
        [deporte]
      );

      let deporteId;
      
      if (deportes.length > 0) {
        // Si el deporte ya existe, usar su ID
        deporteId = deportes[0].id;
        console.log('Deporte existente encontrado con ID:', deporteId);
      } else {
        // Si el deporte no existe, crearlo
        console.log('Creando nuevo deporte...');
        const [nuevoDeporte] = await connection.execute(
          `INSERT INTO DEPORTE (nombre, descripcion) 
           VALUES (?, ?)`,
          [deporte, `Deporte: ${deporte}`]
        );
        deporteId = nuevoDeporte.insertId;
        console.log('Nuevo deporte creado con ID:', deporteId);
      }

      // Relacionar el cliente con el deporte
      console.log('Relacionando cliente con deporte...');
      await connection.execute(
        `INSERT INTO CLIENTE_DEPORTE (cliente_id, deporte_id) 
         VALUES (?, ?)`,
        [clienteId, deporteId]
      );
      console.log('Relación cliente-deporte creada');
    }

    // 4. Si se proporciona una posición, insertarla o relacionarla
    if (posicion && posicion.trim() !== '') {
      try {
        console.log('Procesando posición:', posicion);
        
        // Verificar si la posición ya existe
        const [posiciones] = await connection.execute(
          `SELECT id FROM POSICION WHERE nombre = ?`,
          [posicion]
        );

        let posicionId;
        
        if (posiciones.length > 0) {
          // Si la posición ya existe, usar su ID
          posicionId = posiciones[0].id;
          console.log(`Posición "${posicion}" encontrada con ID ${posicionId}`);
        } else {
          // Si la posición no existe, crearla
          console.log('Creando nueva posición...');
          const [nuevaPosicion] = await connection.execute(
            `INSERT INTO POSICION (nombre, descripcion) 
             VALUES (?, ?)`,
            [posicion, `Posición: ${posicion}`]
          );
          posicionId = nuevaPosicion.insertId;
          console.log(`Nueva posición creada con ID ${posicionId}`);
        }

        // Relacionar el cliente con la posición
        console.log('Relacionando cliente con posición...');
        await connection.execute(
          `INSERT INTO CLIENTE_POSICION (cliente_id, posicion_id) 
           VALUES (?, ?)`,
          [clienteId, posicionId]
        );
        console.log('Relación cliente-posición creada');
      } catch (error) {
        console.error('Error al procesar la posición:', error);
        throw error;
      }
    }

    // 5. Si se proporcionan lesiones, registrarlas
    if (lesiones && lesiones !== 'Ninguna') {
      console.log('Procesando lesiones:', lesiones);
      
      await connection.execute(
        `INSERT INTO CLIENTE_LESION (cliente_id, nombre, fecha_inicio, observaciones) 
         VALUES (?, ?, CURDATE(), ?)`,
        [clienteId, lesiones, `Lesión reportada al registrar el usuario`]
      );
      console.log('Lesión registrada');
    }

    // Confirmar la transacción
    await connection.commit();
    console.log('Transacción confirmada');

    // Responder con éxito
    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: {
        id: clienteId,
        personaId: personaId,
        nombre: nombreCompleto,
        apellido: apellidoCompleto,
        email,
        telefono,
        programa
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    // Si hay una conexión activa, hacer rollback
    if (connection) {
      try {
        await connection.rollback();
        console.log('Rollback realizado');
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  } finally {
    // Cerrar la conexión si se estableció
    if (connection) {
      await connection.release();
      console.log('Conexión cerrada');
    }
  }
});

// Ruta para desactivar un usuario (cliente)
app.delete('/api/usuarios/:id', async (req, res) => {
  let connection;
  try {
    console.log(`Solicitud recibida para desactivar usuario con ID: ${req.params.id}`);
    
    const clienteId = req.params.id;
    
    if (!clienteId) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente no proporcionado'
      });
    }
    
    // Crear conexión a la base de datos
    connection = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await connection.execute('SET NAMES utf8mb4');
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Verificar si el cliente existe
    const [clienteExiste] = await connection.execute(
      `SELECT id FROM CLIENTE WHERE id = ?`,
      [clienteId]
    );
    
    if (clienteExiste.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Desactivar el cliente (en lugar de eliminarlo)
    await connection.execute(
      `UPDATE CLIENTE SET activo = FALSE WHERE id = ?`,
      [clienteId]
    );
    
    // Confirmar la transacción
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Usuario desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    
    // Si hay una conexión activa, hacer rollback
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al desactivar usuario',
      error: error.message
    });
  } finally {
    // Cerrar la conexión si se estableció
    if (connection) {
      await connection.release();
    }
  }
});

// Ruta para actualizar un usuario (cliente)
app.put('/api/usuarios/:id', async (req, res) => {
  let connection;
  try {
    console.log(`Solicitud recibida para actualizar usuario con ID: ${req.params.id}`);
    console.log('Datos recibidos:', JSON.stringify(req.body));
    
    const clienteId = req.params.id;
    
    if (!clienteId) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente no proporcionado'
      });
    }
    
    // Extraer los datos del cuerpo de la solicitud
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      telefono,
      email,
      programa,
      deporte,
      deporteNombre,
      posicion,
      lesiones,
      dob
    } = req.body;
    
    console.log('Fecha de nacimiento recibida:', dob);
    
    // Validar campos obligatorios
    if (!primerNombre || !primerApellido || !telefono || !email || !programa) {
      console.log('Error: Faltan campos obligatorios');
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }
    
    // Crear conexión a la base de datos
    connection = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await connection.execute('SET NAMES utf8mb4');
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Verificar si el cliente existe
    const [clienteExiste] = await connection.execute(
      `SELECT c.id, p.id as persona_id, p.email 
       FROM CLIENTE c 
       JOIN PERSONA p ON c.persona_id = p.id 
       WHERE c.id = ?`,
      [clienteId]
    );
    
    if (clienteExiste.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    const personaId = clienteExiste[0].persona_id;
    const emailActual = clienteExiste[0].email;
    
    // Verificar si el nuevo email ya existe (solo si se está cambiando)
    if (email !== emailActual) {
      const [emailExists] = await connection.execute(
        `SELECT id FROM PERSONA WHERE email = ? AND id != ?`,
        [email, personaId]
      );
      
      if (emailExists.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este correo electrónico',
          error: 'EMAIL_EXISTS'
        });
      }
    }
    
    // Actualizar los datos de la persona
    const nombreCompleto = segundoNombre 
      ? `${primerNombre} ${segundoNombre}` 
      : primerNombre;
    
    const apellidoCompleto = segundoApellido 
      ? `${primerApellido} ${segundoApellido}` 
      : primerApellido;
    
    let fechaNacimiento = null;
    if (dob && typeof dob === 'string' && dob.trim() !== '') {
      try {
        // Crear un objeto Date con la fecha recibida
        // Usar split y new Date(año, mes-1, día) para evitar problemas de zona horaria
        const [year, month, day] = dob.split('-').map(num => parseInt(num, 10));
        const fechaObj = new Date(year, month - 1, day);
        
        if (!isNaN(fechaObj.getTime())) {
          // Formato YYYY-MM-DD para MySQL
          const formattedYear = fechaObj.getFullYear();
          const formattedMonth = String(fechaObj.getMonth() + 1).padStart(2, '0');
          const formattedDay = String(fechaObj.getDate()).padStart(2, '0');
          fechaNacimiento = `${formattedYear}-${formattedMonth}-${formattedDay}`;
        }
      } catch (error) {
        console.error('Error al procesar la fecha de nacimiento:', error);
      }
    }
    console.log('Fecha de nacimiento formateada para BD:', fechaNacimiento);
    
    await connection.execute(
      `UPDATE PERSONA 
       SET nombre = ?, apellido = ?, email = ?, telefono = ?, fecha_nacimiento = ? 
       WHERE id = ?`,
      [nombreCompleto, apellidoCompleto, email, telefono, fechaNacimiento, personaId]
    );
    
    // Actualizar los datos del cliente
    await connection.execute(
      `UPDATE CLIENTE 
       SET objetivo = ? 
       WHERE id = ?`,
      [programa, clienteId]
    );
    
    // Procesar el deporte si se proporciona
    if ((deporte && deporte.trim() !== '') || (deporteNombre && deporteNombre.trim() !== '')) {
      try {
        // Usar deporteNombre si está disponible, de lo contrario usar deporte
        const nombreDeporte = deporteNombre ? deporteNombre.trim() : deporte.trim();
        console.log('Procesando deporte:', nombreDeporte);
        
        // Verificar si el cliente ya tiene un deporte asociado
        const [deporteActual] = await connection.execute(
          `SELECT cd.id, d.id as deporte_id, d.nombre 
           FROM CLIENTE_DEPORTE cd 
           JOIN DEPORTE d ON cd.deporte_id = d.id 
           WHERE cd.cliente_id = ?`,
          [clienteId]
        );
        
        // Verificar si el deporte existe en la base de datos
        const [deporteExistente] = await connection.execute(
          `SELECT id FROM DEPORTE WHERE nombre = ?`,
          [nombreDeporte]
        );
        
        let deporteId;
        
        if (deporteExistente.length > 0) {
          // El deporte ya existe, usar su ID
          deporteId = deporteExistente[0].id;
          console.log(`Deporte "${nombreDeporte}" encontrado con ID ${deporteId}`);
        } else {
          // El deporte no existe, insertarlo
          const [resultadoInsertDeporte] = await connection.execute(
            `INSERT INTO DEPORTE (nombre) VALUES (?)`,
            [nombreDeporte]
          );
          deporteId = resultadoInsertDeporte.insertId;
          console.log(`Nuevo deporte "${nombreDeporte}" creado con ID ${deporteId}`);
        }
        
        if (deporteActual.length > 0) {
          // El cliente ya tiene un deporte, actualizarlo
          await connection.execute(
            `UPDATE CLIENTE_DEPORTE SET deporte_id = ? WHERE id = ?`,
            [deporteId, deporteActual[0].id]
          );
          console.log(`Deporte actualizado para el cliente ${clienteId}`);
        } else {
          // El cliente no tiene un deporte, insertarlo
          await connection.execute(
            `INSERT INTO CLIENTE_DEPORTE (cliente_id, deporte_id) VALUES (?, ?)`,
            [clienteId, deporteId]
          );
          console.log(`Nuevo deporte asignado al cliente ${clienteId}`);
        }
      } catch (error) {
        console.error('Error al procesar el deporte:', error);
        throw error;
      }
    }
    
    // Procesar la posición si se proporciona
    if (posicion && posicion.trim() !== '') {
      try {
        console.log('Procesando posición:', posicion);
        
        // Verificar si el cliente ya tiene una posición asociada
        const [posicionActual] = await connection.execute(
          `SELECT cp.id, p.id as posicion_id, p.nombre 
           FROM CLIENTE_POSICION cp 
           JOIN POSICION p ON cp.posicion_id = p.id 
           WHERE cp.cliente_id = ?`,
          [clienteId]
        );
        
        // Verificar si la posición existe en la base de datos
        const [posicionExistente] = await connection.execute(
          `SELECT id FROM POSICION WHERE nombre = ?`,
          [posicion]
        );
        
        let posicionId;
        
        if (posicionExistente.length > 0) {
          // La posición ya existe, usar su ID
          posicionId = posicionExistente[0].id;
          console.log(`Posición "${posicion}" encontrada con ID ${posicionId}`);
        } else {
          // La posición no existe, insertarla
          const [resultadoInsertPosicion] = await connection.execute(
            `INSERT INTO POSICION (nombre) VALUES (?)`,
            [posicion]
          );
          posicionId = resultadoInsertPosicion.insertId;
          console.log(`Nueva posición "${posicion}" creada con ID ${posicionId}`);
        }
        
        if (posicionActual.length > 0) {
          // El cliente ya tiene una posición, actualizarla
          await connection.execute(
            `UPDATE CLIENTE_POSICION SET posicion_id = ? WHERE id = ?`,
            [posicionId, posicionActual[0].id]
          );
          console.log(`Posición actualizada para el cliente ${clienteId}`);
        } else {
          // El cliente no tiene una posición, insertarla
          await connection.execute(
            `INSERT INTO CLIENTE_POSICION (cliente_id, posicion_id) VALUES (?, ?)`,
            [clienteId, posicionId]
          );
          console.log(`Nueva posición asignada al cliente ${clienteId}`);
        }
      } catch (error) {
        console.error('Error al procesar la posición:', error);
        throw error;
      }
    } else if (posicion === '') {
      // Si se envía un valor vacío, eliminar la relación existente
      const [posicionActual] = await connection.execute(
        `SELECT id FROM CLIENTE_POSICION WHERE cliente_id = ?`,
        [clienteId]
      );
      
      if (posicionActual.length > 0) {
        await connection.execute(
          `DELETE FROM CLIENTE_POSICION WHERE id = ?`,
          [posicionActual[0].id]
        );
        console.log(`Posición eliminada para el cliente ${clienteId}`);
      }
    }
    
    // Actualizar lesiones (si se proporcionan)
    console.log('Procesando lesiones:', lesiones);
    if (lesiones && lesiones.trim() !== '' && lesiones !== 'Ninguna') {
      // Verificar si el cliente ya tiene lesiones registradas
      const [lesionesActuales] = await connection.execute(
        `SELECT id FROM CLIENTE_LESION WHERE cliente_id = ?`,
        [clienteId]
      );
      
      if (lesionesActuales.length > 0) {
        // Actualizar la lesión existente
        await connection.execute(
          `UPDATE CLIENTE_LESION 
           SET nombre = ?, observaciones = ? 
           WHERE id = ?`,
          [lesiones, `Lesión actualizada: ${lesiones}`, lesionesActuales[0].id]
        );
      } else {
        // Crear un nuevo registro de lesión
        await connection.execute(
          `INSERT INTO CLIENTE_LESION (cliente_id, nombre, fecha_inicio, observaciones) 
           VALUES (?, ?, CURDATE(), ?)`,
          [clienteId, lesiones, `Lesión reportada al actualizar el usuario`]
        );
      }
    } else if (lesiones === '' || lesiones === 'Ninguna') {
      // Si se envía un valor vacío o "Ninguna", eliminar la relación existente
      const [lesionesActuales] = await connection.execute(
        `SELECT id FROM CLIENTE_LESION WHERE cliente_id = ?`,
        [clienteId]
      );
      
      if (lesionesActuales.length > 0) {
        await connection.execute(
          `DELETE FROM CLIENTE_LESION WHERE id = ?`,
          [lesionesActuales[0].id]
        );
      }
    }
    
    // Confirmar la transacción
    await connection.commit();
    
    // Responder con éxito
    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: {
        id: clienteId,
        personaId: personaId,
        nombre: nombreCompleto,
        apellido: apellidoCompleto,
        email,
        telefono,
        programa
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    // Si hay una conexión activa, hacer rollback
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  } finally {
    // Cerrar la conexión si se estableció
    if (connection) {
      await connection.release();
    }
  }
});

// Ruta para obtener todos los deportes
app.get('/api/deportes', async (req, res) => {
  let conn;
  try {
    console.log('Recibida solicitud GET /api/deportes');
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Consultar todos los deportes
    const [deportes] = await conn.execute('SELECT * FROM DEPORTE ORDER BY nombre');
    
    console.log(`Se encontraron ${deportes.length} deportes`);
    
    // Enviar respuesta
    res.json(deportes);
  } catch (error) {
    console.error('Error al obtener deportes:', error);
    res.status(500).json({ error: 'Error al obtener deportes' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Endpoint para obtener una posición por su ID o posiciones por deporte
app.get('/api/posiciones/deporte/:id', async (req, res) => {
  let conn;
  try {
    const deporteId = parseInt(req.params.id);
    console.log('Recibida solicitud GET /api/posiciones/deporte/:id con id:', deporteId);
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Buscar posiciones por deporte_id
    const [posiciones] = await conn.execute(
      'SELECT * FROM POSICION WHERE deporte_id = ? ORDER BY nombre',
      [deporteId]
    );
    
    console.log('Posiciones encontradas para deporte:', posiciones.length);
    res.json(posiciones);
  } catch (error) {
    console.error('Error al obtener posiciones por deporte:', error);
    res.status(500).json({ error: 'Error al obtener las posiciones' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Endpoint para obtener una posición por su ID
app.get('/api/posiciones/:id', async (req, res) => {
  let conn;
  try {
    const posicionId = parseInt(req.params.id);
    console.log('Recibida solicitud GET /api/posiciones/:id con id:', posicionId);
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Buscar posición por ID
    const [posiciones] = await conn.execute(
      'SELECT * FROM POSICION WHERE id = ?',
      [posicionId]
    );
    
    if (posiciones.length === 0) {
      console.log('No se encontró posición con ID:', posicionId);
      return res.status(404).json({ error: 'Posición no encontrada' });
    }
    
    console.log('Posición encontrada:', posiciones[0]);
    res.json(posiciones[0]);
  } catch (error) {
    console.error('Error al obtener posición:', error);
    res.status(500).json({ error: 'Error al obtener la posición' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Endpoint para crear un nuevo deporte
app.post('/api/deportes', async (req, res) => {
  let conn;
  try {
    console.log('Recibida solicitud POST /api/deportes');
    console.log('Datos recibidos:', req.body);
    
    // Validar datos recibidos
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del deporte es obligatorio' });
    }
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Obtener el máximo ID actual para asignar el siguiente
    const [maxIdResult] = await conn.execute('SELECT MAX(id) as maxId FROM DEPORTE');
    const nextId = maxIdResult[0].maxId ? maxIdResult[0].maxId + 1 : 1;
    
    console.log('Siguiente ID a asignar:', nextId);
    
    // Insertar el nuevo deporte con el ID específico
    await conn.execute(
      'INSERT INTO DEPORTE (id, nombre, descripcion) VALUES (?, ?, ?)',
      [nextId, nombre, descripcion || '']
    );
    
    console.log('Deporte creado con ID:', nextId);
    
    // Obtener el deporte recién creado
    const [deportes] = await conn.execute('SELECT * FROM DEPORTE WHERE id = ?', [nextId]);
    
    // Enviar respuesta
    res.status(201).json({
      success: true,
      message: 'Deporte creado correctamente',
      data: deportes[0]
    });
  } catch (error) {
    console.error('Error al crear deporte:', error);
    res.status(500).json({ error: 'Error al crear el deporte' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Endpoint para obtener un deporte por su ID
app.get('/api/deportes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deportes] = await connection.execute(
      'SELECT * FROM DEPORTE WHERE id = ?',
      [id]
    );
    
    if (deportes.length === 0) {
      return res.status(404).json({ error: 'Deporte no encontrado' });
    }
    
    res.json(deportes[0]);
  } catch (error) {
    console.error('Error al obtener deporte:', error);
    res.status(500).json({ error: 'Error al obtener el deporte' });
  }
});

// Endpoint para actualizar un deporte
app.put('/api/deportes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    // Validar que el nombre no esté vacío
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del deporte es obligatorio' });
    }
    
    // Verificar si existe el deporte
    const [deportes] = await connection.execute(
      'SELECT * FROM DEPORTE WHERE id = ?',
      [id]
    );
    
    if (deportes.length === 0) {
      return res.status(404).json({ error: 'Deporte no encontrado' });
    }
    
    // Verificar si ya existe otro deporte con ese nombre
    const [deportesExistentes] = await connection.execute(
      'SELECT * FROM DEPORTE WHERE nombre = ? AND id != ?',
      [nombre, id]
    );
    
    if (deportesExistentes.length > 0) {
      return res.status(400).json({ error: 'Ya existe otro deporte con ese nombre' });
    }
    
    // Actualizar el deporte
    await connection.execute(
      'UPDATE DEPORTE SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion || null, id]
    );
    
    res.json({
      id: parseInt(id),
      nombre,
      descripcion
    });
  } catch (error) {
    console.error('Error al actualizar deporte:', error);
    res.status(500).json({ error: 'Error al actualizar el deporte' });
  }
});

// Endpoint para eliminar un deporte
app.delete('/api/deportes/:id', async (req, res) => {
  let conn;
  try {
    console.log(`Recibida solicitud DELETE /api/deportes/${req.params.id}`);
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Verificar si el deporte existe
    const [deportes] = await conn.execute('SELECT * FROM DEPORTE WHERE id = ?', [req.params.id]);
    
    if (deportes.length === 0) {
      console.log(`No se encontró el deporte con ID ${req.params.id}`);
      return res.status(404).json({ error: 'Deporte no encontrado' });
    }
    
    try {
      // Intentar eliminar el deporte
      await conn.execute('DELETE FROM DEPORTE WHERE id = ?', [req.params.id]);
      
      console.log(`Deporte con ID ${req.params.id} eliminado correctamente`);
      
      // Enviar respuesta
      res.json({ 
        success: true, 
        message: 'Deporte eliminado correctamente' 
      });
    } catch (deleteError) {
      // Si hay un error de clave foránea (error 1451)
      if (deleteError.errno === 1451) {
        console.error('Error al eliminar deporte: Restricción de clave foránea', deleteError);
        return res.status(400).json({ 
          error: 'No se puede eliminar el deporte porque está siendo utilizado por uno o más usuarios' 
        });
      }
      // Si es otro tipo de error, relanzarlo para que lo maneje el catch externo
      throw deleteError;
    }
  } catch (error) {
    console.error('Error al eliminar deporte:', error);
    res.status(500).json({ error: 'Error al eliminar el deporte' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Endpoint para crear una nueva posición
app.post('/api/posiciones', async (req, res) => {
  let conn;
  try {
    console.log('Recibida solicitud POST /api/posiciones');
    console.log('Datos recibidos:', req.body);
    
    // Validar datos recibidos
    const { nombre, descripcion, deporteId, deporte_id } = req.body;
    
    // Usar deporte_id si está disponible, de lo contrario usar deporteId
    const deporteIdFinal = deporte_id || deporteId;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la posición es obligatorio' });
    }
    
    if (!deporteIdFinal) {
      return res.status(400).json({ error: 'El deporte es obligatorio' });
    }
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Obtener el máximo ID actual para asignar el siguiente
    const [maxIdResult] = await conn.execute('SELECT MAX(id) as maxId FROM POSICION');
    const nextId = maxIdResult[0].maxId ? maxIdResult[0].maxId + 1 : 1;
    
    console.log('Siguiente ID a asignar:', nextId);
    
    // Verificar si la tabla POSICION tiene un campo deporte_id
    let posicionId;
    try {
      // Intentar insertar la posición con el campo deporte_id
      await conn.execute(
        'INSERT INTO POSICION (id, nombre, descripcion, deporte_id) VALUES (?, ?, ?, ?)',
        [nextId, nombre, descripcion || '', deporteIdFinal]
      );
      posicionId = nextId;
    } catch (error) {
      console.error('Error al insertar posición con deporte_id:', error);
      
      // Si hay un error, puede ser que la tabla no tenga el campo deporte_id
      // En ese caso, insertamos sin ese campo
      await conn.execute(
        'INSERT INTO POSICION (id, nombre, descripcion) VALUES (?, ?, ?)',
        [nextId, nombre, descripcion || '']
      );
      posicionId = nextId;
    }
    
    console.log('Posición creada con ID:', posicionId);
    
    // Obtener la posición recién creada
    const [posiciones] = await conn.execute('SELECT * FROM POSICION WHERE id = ?', [posicionId]);
    
    // Enviar respuesta
    res.status(201).json({
      success: true,
      message: 'Posición creada correctamente',
      data: posiciones[0]
    });
  } catch (error) {
    console.error('Error al crear posición:', error);
    res.status(500).json({ error: 'Error al crear la posición' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Endpoint para obtener todas las posiciones
app.get('/api/posiciones', async (req, res) => {
  try {
    const [posiciones] = await connection.execute('SELECT * FROM POSICION ORDER BY nombre');
    res.json(posiciones);
  } catch (error) {
    console.error('Error al obtener posiciones:', error);
    res.status(500).json({ error: 'Error al obtener las posiciones' });
  }
});

// Endpoint para obtener una posición por su ID
app.get('/api/posiciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [posiciones] = await connection.execute(
      'SELECT * FROM POSICION WHERE id = ?',
      [id]
    );
    
    if (posiciones.length === 0) {
      return res.status(404).json({ error: 'Posición no encontrada' });
    }
    
    res.json(posiciones[0]);
  } catch (error) {
    console.error('Error al obtener posición:', error);
    res.status(500).json({ error: 'Error al obtener la posición' });
  }
});

// Endpoint para actualizar una posición
app.put('/api/posiciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    // Validar que el nombre no esté vacío
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la posición es obligatorio' });
    }
    
    // Verificar si existe la posición
    const [posiciones] = await connection.execute(
      'SELECT * FROM POSICION WHERE id = ?',
      [id]
    );
    
    if (posiciones.length === 0) {
      return res.status(404).json({ error: 'Posición no encontrada' });
    }
    
    // Verificar si ya existe otra posición con ese nombre
    const [posicionesExistentes] = await connection.execute(
      'SELECT * FROM POSICION WHERE nombre = ? AND id != ?',
      [nombre, id]
    );
    
    if (posicionesExistentes.length > 0) {
      return res.status(400).json({ error: 'Ya existe otra posición con ese nombre' });
    }
    
    // Actualizar la posición
    await connection.execute(
      'UPDATE POSICION SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion || null, id]
    );
    
    res.json({
      id: parseInt(id),
      nombre,
      descripcion
    });
  } catch (error) {
    console.error('Error al actualizar posición:', error);
    res.status(500).json({ error: 'Error al actualizar la posición' });
  }
});

// Endpoint para eliminar una posición
app.delete('/api/posiciones/:id', async (req, res) => {
  let conn;
  try {
    const posicionId = parseInt(req.params.id);
    console.log(`Recibida solicitud DELETE /api/posiciones/${posicionId}`);
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Verificar si la posición existe
    const [posiciones] = await conn.execute(
      'SELECT * FROM POSICION WHERE id = ?',
      [posicionId]
    );
    
    if (posiciones.length === 0) {
      console.log(`No se encontró la posición con ID ${posicionId}`);
      return res.status(404).json({ error: 'Posición no encontrada' });
    }
    
    // Verificar si la posición está siendo utilizada por usuarios
    try {
      // Verificar en la tabla POSICIONES_EN_USO
      const [tablasSimulacion] = await conn.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'POSICIONES_EN_USO'
      `, [process.env.DB_DATABASE]);
      
      if (tablasSimulacion.length > 0) {
        // Si la tabla POSICIONES_EN_USO existe, verificamos si hay registros para esta posición
        const [usuariosSimulados] = await conn.execute(
          'SELECT COUNT(*) as count FROM POSICIONES_EN_USO WHERE posicion_id = ?',
          [posicionId]
        );
        
        if (usuariosSimulados[0].count > 0) {
          console.log(`La posición con ID ${posicionId} está siendo utilizada por ${usuariosSimulados[0].count} usuarios simulados`);
          return res.status(400).json({ 
            error: 'No se puede eliminar la posición porque está siendo utilizada por uno o más usuarios' 
          });
        }
      }
      
      // Primero verificamos si existe la tabla USUARIO
      const [tablas] = await conn.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'USUARIO'
      `, [process.env.DB_DATABASE]);
      
      if (tablas.length > 0) {
        // Si la tabla USUARIO existe, verificamos si tiene la columna posicion_id
        const [columnas] = await conn.execute(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'USUARIO' AND COLUMN_NAME = 'posicion_id'
        `, [process.env.DB_DATABASE]);
        
        if (columnas.length > 0) {
          // Si la columna posicion_id existe, verificamos si hay usuarios que usan esta posición
          const [usuarios] = await conn.execute(
            'SELECT COUNT(*) as count FROM USUARIO WHERE posicion_id = ?',
            [posicionId]
          );
          
          if (usuarios[0].count > 0) {
            console.log(`La posición con ID ${posicionId} está siendo utilizada por ${usuarios[0].count} usuarios`);
            return res.status(400).json({ 
              error: 'No se puede eliminar la posición porque está siendo utilizada por uno o más usuarios' 
            });
          }
        }
      }
      
      // También verificamos en la tabla CLIENTE_POSICION si existe
      const [tablasClientePosicion] = await conn.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'CLIENTE_POSICION'
      `, [process.env.DB_DATABASE]);
      
      if (tablasClientePosicion.length > 0) {
        // Si la tabla CLIENTE_POSICION existe, verificamos si hay clientes que usan esta posición
        const [clientesPosicion] = await conn.execute(
          'SELECT COUNT(*) as count FROM CLIENTE_POSICION WHERE posicion_id = ?',
          [posicionId]
        );
        
        if (clientesPosicion[0].count > 0) {
          console.log(`La posición con ID ${posicionId} está siendo utilizada por ${clientesPosicion[0].count} clientes`);
          return res.status(400).json({ 
            error: 'No se puede eliminar la posición porque está siendo utilizada por uno o más clientes' 
          });
        }
      }
    } catch (error) {
      console.error('Error al verificar dependencias:', error);
      // Continuamos con la eliminación si hay un error en la verificación
    }
    
    // Eliminar la posición directamente sin verificar dependencias
    await conn.execute(
      'DELETE FROM POSICION WHERE id = ?',
      [posicionId]
    );
    
    console.log(`Posición con ID ${posicionId} eliminada correctamente`);
    
    // Enviar respuesta
    res.json({ 
      success: true, 
      message: 'Posición eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar posición:', error);
    res.status(500).json({ error: 'Error al eliminar la posición' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Endpoint para asociar una posición a un deporte
app.post('/api/deportes/:deporteId/posiciones/:posicionId', async (req, res) => {
  try {
    const { deporteId, posicionId } = req.params;
    
    // Verificar si existe el deporte
    const [deportes] = await connection.execute(
      'SELECT * FROM DEPORTE WHERE id = ?',
      [deporteId]
    );
    
    if (deportes.length === 0) {
      return res.status(404).json({ error: 'Deporte no encontrado' });
    }
    
    // Verificar si existe la posición
    const [posiciones] = await connection.execute(
      'SELECT * FROM POSICION WHERE id = ?',
      [posicionId]
    );
    
    if (posiciones.length === 0) {
      return res.status(404).json({ error: 'Posición no encontrada' });
    }
    
    // Verificar si ya existe la asociación
    const [asociaciones] = await connection.execute(
      'SELECT * FROM DEPORTE_POSICION WHERE id_deporte = ? AND id_posicion = ?',
      [deporteId, posicionId]
    );
    
    if (asociaciones.length > 0) {
      return res.status(400).json({ error: 'La posición ya está asociada al deporte' });
    }
    
    // Crear la asociación
    await connection.execute(
      'INSERT INTO DEPORTE_POSICION (id_deporte, id_posicion) VALUES (?, ?)',
      [deporteId, posicionId]
    );
    
    res.status(201).json({
      deporteId: parseInt(deporteId),
      posicionId: parseInt(posicionId),
      message: 'Posición asociada al deporte correctamente'
    });
  } catch (error) {
    console.error('Error al asociar posición al deporte:', error);
    res.status(500).json({ error: 'Error al asociar la posición al deporte' });
  }
});

// Endpoint para desasociar una posición de un deporte
app.delete('/api/deportes/:deporteId/posiciones/:posicionId', async (req, res) => {
  try {
    const { deporteId, posicionId } = req.params;
    
    // Verificar si existe la asociación
    const [asociaciones] = await connection.execute(
      'SELECT * FROM DEPORTE_POSICION WHERE id_deporte = ? AND id_posicion = ?',
      [deporteId, posicionId]
    );
    
    if (asociaciones.length === 0) {
      return res.status(404).json({ error: 'La posición no está asociada al deporte' });
    }
    
    // Eliminar la asociación
    await connection.execute(
      'DELETE FROM DEPORTE_POSICION WHERE id_deporte = ? AND id_posicion = ?',
      [deporteId, posicionId]
    );
    
    res.json({
      deporteId: parseInt(deporteId),
      posicionId: parseInt(posicionId),
      message: 'Posición desasociada del deporte correctamente'
    });
  } catch (error) {
    console.error('Error al desasociar posición del deporte:', error);
    res.status(500).json({ error: 'Error al desasociar la posición del deporte' });
  }
});

// Endpoint para inicializar deportes de ejemplo (solo para desarrollo)
app.get('/api/inicializar-deportes', async (req, res) => {
  let conn;
  try {
    console.log('Recibida solicitud GET /api/inicializar-deportes');
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Verificar si ya hay deportes en la tabla
    const [deportes] = await conn.execute('SELECT COUNT(*) as count FROM DEPORTE');
    
    if (deportes[0].count > 0) {
      console.log(`La tabla DEPORTE ya contiene ${deportes[0].count} registros.`);
      return res.json({ 
        success: true, 
        message: `La tabla DEPORTE ya contiene ${deportes[0].count} registros.` 
      });
    }
    
    console.log('La tabla DEPORTE está vacía. Insertando deportes de ejemplo...');
    
    // Insertar deportes de ejemplo
    const deportesEjemplo = [
      ['Fútbol', 'Deporte de equipo jugado con un balón entre dos equipos de 11 jugadores'],
      ['Baloncesto', 'Deporte de equipo jugado con un balón entre dos equipos de 5 jugadores'],
      ['Voleibol', 'Deporte de equipo jugado con un balón entre dos equipos de 6 jugadores'],
      ['Tenis', 'Deporte de raqueta jugado entre dos jugadores o dos parejas'],
      ['Natación', 'Deporte acuático que consiste en el desplazamiento en el agua'],
      ['Atletismo', 'Conjunto de disciplinas deportivas que incluyen carreras, saltos y lanzamientos'],
      ['Ciclismo', 'Deporte que implica el uso de la bicicleta'],
      ['Fútbol Americano', 'Deporte de equipo jugado con un balón ovalado entre dos equipos de 11 jugadores']
    ];
    
    // Insertar cada deporte
    for (const [nombre, descripcion] of deportesEjemplo) {
      await conn.execute(
        'INSERT INTO DEPORTE (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion]
      );
    }
    
    // Verificar cuántos deportes se insertaron
    const [deportesInsertados] = await conn.execute('SELECT COUNT(*) as count FROM DEPORTE');
    console.log(`Se insertaron ${deportesInsertados[0].count} deportes de ejemplo.`);
    
    res.json({ 
      success: true, 
      message: `Se insertaron ${deportesInsertados[0].count} deportes de ejemplo.` 
    });
  } catch (error) {
    console.error('Error al inicializar deportes:', error);
    res.status(500).json({ error: 'Error al inicializar deportes' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Endpoint para actualizar las posiciones existentes con el deporte correcto
app.get('/api/actualizar-posiciones', async (req, res) => {
  let conn;
  try {
    console.log('Recibida solicitud GET /api/actualizar-posiciones');
    
    // Obtener una conexión del pool
    conn = await pool.getConnection();
    
    // Configurar la conexión para usar UTF-8
    await conn.execute('SET NAMES utf8mb4');
    
    // Obtener todos los deportes
    const [deportes] = await conn.execute('SELECT * FROM DEPORTE');
    
    // Mapeo de nombres de posiciones a deportes
    const mapeoDeportes = {
      'Delantero': 'Fútbol',
      'Defensa': 'Fútbol',
      'Portero': 'Fútbol',
      'Mediocampista': 'Fútbol',
      'Base': 'Baloncesto',
      'Escolta': 'Baloncesto',
      'Alero': 'Baloncesto',
      'Ala-Pívot': 'Baloncesto',
      'Pívot': 'Baloncesto',
      'Colocador': 'Voleibol',
      'Opuesto': 'Voleibol',
      'Central': 'Voleibol',
      'Receptor': 'Voleibol',
      'Líbero': 'Voleibol',
      'Individual': 'Tenis',
      'Dobles': 'Tenis'
    };
    
    // Obtener todas las posiciones
    const [posiciones] = await conn.execute('SELECT * FROM POSICION');
    
    // Contador de posiciones actualizadas
    let posicionesActualizadas = 0;
    
    // Actualizar cada posición con el deporte correcto
    for (const posicion of posiciones) {
      // Verificar si la posición ya tiene un deporte_id
      if (posicion.deporte_id) {
        console.log(`La posición ${posicion.nombre} (ID: ${posicion.id}) ya tiene un deporte_id: ${posicion.deporte_id}`);
        continue;
      }
      
      const nombreDeporte = mapeoDeportes[posicion.nombre];
      
      if (nombreDeporte) {
        // Buscar el deporte por nombre
        const deporte = deportes.find(d => d.nombre === nombreDeporte);
        
        if (deporte) {
          // Actualizar la posición con el deporte_id correcto
          await conn.execute(
            'UPDATE POSICION SET deporte_id = ? WHERE id = ?',
            [deporte.id, posicion.id]
          );
          
          console.log(`Posición ${posicion.nombre} (ID: ${posicion.id}) actualizada con deporte_id: ${deporte.id} (${deporte.nombre})`);
          posicionesActualizadas++;
        }
      }
    }
    
    console.log(`Se actualizaron ${posicionesActualizadas} posiciones con el deporte correcto.`);
    
    // Enviar respuesta
    res.json({
      success: true,
      message: `Se actualizaron ${posicionesActualizadas} posiciones con el deporte correcto.`
    });
  } catch (error) {
    console.error('Error al actualizar posiciones:', error);
    res.status(500).json({ error: 'Error al actualizar las posiciones' });
  } finally {
    // Liberar la conexión
    if (conn) {
      conn.release();
    }
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
