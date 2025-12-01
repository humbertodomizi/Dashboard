#!/bin/bash

# Script para construir las imágenes Docker
# Uso: ./setup.sh [api|dashboard]
# Si no se proporciona parámetro, construye ambas imágenes

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para construir la imagen de la API
build_api() {
    echo -e "${BLUE}🔨 Construyendo imagen de la API...${NC}"
    docker build -f Dockerfile.api -t dashboard-api:latest ../..
    echo -e "${GREEN}✅ Imagen de la API construida exitosamente${NC}"
}

# Función para construir la imagen del Dashboard
build_dashboard() {
    echo -e "${BLUE}🔨 Construyendo imagen del Dashboard...${NC}"
    docker build -f Dockerfile.dashboard -t dashboard-frontend:latest ../..
    echo -e "${GREEN}✅ Imagen del Dashboard construida exitosamente${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: No se encontró docker-compose.yml${NC}"
    echo -e "${YELLOW}   Asegúrate de ejecutar este script desde el directorio envs/docker${NC}"
    exit 1
fi

# Exportar nombre del proyecto para consistencia
export COMPOSE_PROJECT_NAME=dashboard-app

# Procesar argumentos
if [ $# -eq 0 ]; then
    # Sin argumentos, construir ambas imágenes
    echo -e "${BLUE}📦 Construyendo ambas imágenes (API y Dashboard)...${NC}"
    build_api
    build_dashboard
    echo -e "${GREEN}🎉 ¡Todas las imágenes han sido construidas exitosamente!${NC}"
elif [ "$1" == "api" ]; then
    build_api
elif [ "$1" == "dashboard" ]; then
    build_dashboard
else
    echo -e "${YELLOW}⚠️  Parámetro inválido: $1${NC}"
    echo -e "${YELLOW}   Uso: ./setup.sh [api|dashboard]${NC}"
    echo -e "${YELLOW}   Si no se proporciona parámetro, construye ambas imágenes${NC}"
    exit 1
fi

