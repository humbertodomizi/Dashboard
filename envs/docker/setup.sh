#!/bin/bash

# Script para construir las imágenes Docker
# Uso: ./setup.sh [dev|build] [api|dashboard]
# - dev: Modo desarrollo (sin build, con hot-reload)
# - build: Modo producción (con build optimizado)
# Si no se proporciona el primer parámetro, usa 'dev' por defecto
# Si no se proporciona el segundo parámetro, construye ambas imágenes

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Determinar el modo (dev o build)
MODE=${1:-dev}
SERVICE=${2:-all}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: No se encontró docker-compose.yml${NC}"
    echo -e "${YELLOW}   Asegúrate de ejecutar este script desde el directorio envs/docker${NC}"
    exit 1
fi

# Función para construir la imagen de la API (desarrollo)
build_api_dev() {
    echo -e "${BLUE}🔨 Construyendo imagen de la API (desarrollo)...${NC}"
    docker build -f Dockerfile.api -t dashboard-api:latest ../..
    echo -e "${GREEN}✅ Imagen de la API construida exitosamente${NC}"
}

# Función para construir la imagen del Dashboard (desarrollo)
build_dashboard_dev() {
    echo -e "${BLUE}🔨 Construyendo imagen del Dashboard (desarrollo)...${NC}"
    docker build -f Dockerfile.dashboard -t dashboard-frontend:latest ../..
    echo -e "${GREEN}✅ Imagen del Dashboard construida exitosamente${NC}"
}

# Función para construir la imagen de la API (producción)
build_api_prod() {
    echo -e "${BLUE}🔨 Construyendo imagen de la API (producción)...${NC}"
    docker build -f Dockerfile.api.prod -t dashboard-api-prod:latest ../..
    echo -e "${GREEN}✅ Imagen de la API construida exitosamente${NC}"
}

# Función para construir la imagen del Dashboard (producción)
build_dashboard_prod() {
    echo -e "${BLUE}🔨 Construyendo imagen del Dashboard (producción)...${NC}"
    docker build -f Dockerfile.dashboard.prod -t dashboard-frontend-prod:latest ../..
    echo -e "${GREEN}✅ Imagen del Dashboard construida exitosamente${NC}"
}

# Procesar argumentos
if [ "$MODE" == "dev" ]; then
    export COMPOSE_PROJECT_NAME=dashaboard-users-posts
    if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "" ]; then
        echo -e "${BLUE}📦 Construyendo ambas imágenes en modo desarrollo (API y Dashboard)...${NC}"
        build_api_dev
        build_dashboard_dev
        echo -e "${GREEN}🎉 ¡Todas las imágenes han sido construidas exitosamente!${NC}"
    elif [ "$SERVICE" == "api" ]; then
        build_api_dev
    elif [ "$SERVICE" == "dashboard" ]; then
        build_dashboard_dev
    else
        echo -e "${YELLOW}⚠️  Servicio inválido: $SERVICE${NC}"
        echo -e "${YELLOW}   Uso: ./setup.sh dev [api|dashboard]${NC}"
        exit 1
    fi
elif [ "$MODE" == "build" ]; then
    export COMPOSE_PROJECT_NAME=dashboard-users-posts-prod
    if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "" ]; then
        echo -e "${BLUE}📦 Construyendo ambas imágenes en modo producción (API y Dashboard)...${NC}"
        build_api_prod
        build_dashboard_prod
        echo -e "${GREEN}🎉 ¡Todas las imágenes han sido construidas exitosamente!${NC}"
    elif [ "$SERVICE" == "api" ]; then
        build_api_prod
    elif [ "$SERVICE" == "dashboard" ]; then
        build_dashboard_prod
    else
        echo -e "${YELLOW}⚠️  Servicio inválido: $SERVICE${NC}"
        echo -e "${YELLOW}   Uso: ./setup.sh build [api|dashboard]${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Modo inválido: $MODE${NC}"
    echo -e "${YELLOW}   Uso: ./setup.sh [dev|build] [api|dashboard]${NC}"
    echo -e "${YELLOW}   - dev: Modo desarrollo (por defecto)${NC}"
    echo -e "${YELLOW}   - build: Modo producción${NC}"
    exit 1
fi

