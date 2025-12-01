# Dockerización del Dashboard

Este directorio contiene todos los archivos necesarios para dockerizar la aplicación completa (API, Dashboard y MongoDB).

## 📁 Archivos

- **`Dockerfile.api`**: Dockerfile para construir la imagen de la API
- **`Dockerfile.dashboard`**: Dockerfile para construir la imagen del Dashboard
- **`docker-compose.yml`**: Configuración de orquestación de todos los servicios
- **`setup.sh`**: Script para construir las imágenes Docker
- **`start.sh`**: Script para iniciar los contenedores
- **`.dockerignore`**: Archivos a ignorar durante la construcción

## 🚀 Uso Rápido

### 1. Construir las imágenes

Desde el directorio `envs/docker`:

```bash
# Construir ambas imágenes
./setup.sh

# O construir solo la API
./setup.sh api

# O construir solo el Dashboard
./setup.sh dashboard
```

### 2. Iniciar los contenedores

```bash
./start.sh
```

### 3. Acceder a los servicios

- **Dashboard Frontend**: http://localhost:8080
- **API Backend**: http://localhost:3001
- **MongoDB**: localhost:27018

## 🔧 Puertos Utilizados

Para evitar conflictos con otros servicios, se utilizan puertos alternativos:

- **Dashboard**: `8080` (en lugar de 80)
- **API**: `3001` (en lugar de 3000)
- **MongoDB**: `27018` (en lugar de 27017)

## 📝 Comandos Útiles

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f api
docker-compose logs -f dashboard
docker-compose logs -f mongodb
```

### Detener los contenedores
```bash
docker-compose down
```

### Detener y eliminar volúmenes (incluye datos de MongoDB)
```bash
docker-compose down -v
```

### Ver estado de los contenedores
```bash
docker-compose ps
```

### Reconstruir las imágenes
```bash
docker-compose build --no-cache
```

### Ejecutar comandos dentro de un contenedor
```bash
# Acceder a la shell del contenedor de la API
docker-compose exec api sh

# Ejecutar el seed de la base de datos
docker-compose exec api pnpm run seed
```

## 🏗️ Estructura de los Dockerfiles

### Dockerfile.api
- Basado en `node:20-alpine`
- Instala `pnpm` globalmente
- Copia e instala dependencias
- Expone el puerto 3001
- Ejecuta `pnpm start` al iniciar

### Dockerfile.dashboard
- Multi-stage build:
  - **Stage 1 (builder)**: Construye la aplicación Vue con Vite
  - **Stage 2 (production)**: Sirve los archivos estáticos con nginx
- Configura nginx para SPA (Single Page Application)
- La URL de la API se configura durante el build mediante `ARG VITE_API_URL`

## 🔐 Variables de Entorno

Las variables de entorno se configuran en `docker-compose.yml`:

- **API**: `PORT=3001`, `MONGO_URI=mongodb://mongodb:27017/dashboard_db`
- **Dashboard**: `VITE_API_URL=http://localhost:3001/api` (se pasa como ARG durante el build)

## 🗄️ Base de Datos

MongoDB se ejecuta en un contenedor separado con:
- Volumen persistente para los datos
- Healthcheck para asegurar que esté listo antes de iniciar la API
- Puerto expuesto en `27018` para acceso externo (opcional)

### Poblar la base de datos

Después de iniciar los contenedores, puedes poblar la base de datos con datos de ejemplo:

```bash
docker-compose exec api pnpm run seed
```

## 🐛 Solución de Problemas

### Las imágenes no se encuentran
Asegúrate de ejecutar `./setup.sh` antes de `./start.sh`

### Error de conexión a MongoDB
Verifica que el contenedor de MongoDB esté corriendo:
```bash
docker-compose ps
```

### El dashboard no se conecta a la API
Verifica que la variable `VITE_API_URL` en `docker-compose.yml` apunte a la URL correcta de la API.

### Reconstruir desde cero
```bash
docker-compose down -v
docker-compose build --no-cache
./start.sh
```

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)

