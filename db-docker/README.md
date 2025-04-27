# Base de Datos para Aplicación de Entrenadora Lucía

Este proyecto configura una base de datos MySQL en Docker para la aplicación de entrenamiento físico de Lucía.

## Estructura de la Base de Datos

La base de datos implementa el siguiente esquema:

- **PERSONA**: Datos básicos de personas (entrenadores y clientes)
- **ENTRENADOR**: Información específica de entrenadores
- **CLIENTE**: Información específica de clientes
- **POSICION**: Posiciones deportivas
- **DEPORTE**: Deportes disponibles
- **RUTINA**: Rutinas de entrenamiento
- **FASE**: Fases de entrenamiento
- **EJERCICIO**: Ejercicios disponibles
- Y tablas de relación entre estas entidades

## Requisitos

- Docker Desktop instalado
- Puerto 3306 disponible para MySQL
- Puerto 8080 disponible para phpMyAdmin

## Cómo iniciar la base de datos

1. Abre una terminal en la carpeta `db-docker`
2. Ejecuta el siguiente comando:

```
docker-compose up -d
```

3. Espera a que los contenedores se inicien (puede tardar unos minutos la primera vez)

## Acceso a la base de datos

### Usando phpMyAdmin

1. Abre tu navegador y ve a: http://localhost:8080
2. Inicia sesión con:
   - Usuario: `lucia_user`
   - Contraseña: `lucia_password`

### Usando MySQL Client

```
docker exec -it lucia_entrenadora_mysql mysql -ulucia_user -plucia_password lucia_entrenadora_db
```

## Detener la base de datos

```
docker-compose down
```

## Reiniciar la base de datos (borrando todos los datos)

```
docker-compose down -v
docker-compose up -d
```

## Credenciales

- **Base de datos**: lucia_entrenadora_db
- **Usuario**: lucia_user
- **Contraseña**: lucia_password
- **Usuario root**: root
- **Contraseña root**: root_password
