#!/bin/bash

# Script para iniciar los contenedores Docker
# Uso: ./start.sh [dev|build]
# - dev: Modo desarrollo (por defecto)
# - build: Modo producción

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Determinar el modo (dev o build)
MODE=${1:-dev}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: No se encontró docker-compose.yml${NC}"
    echo -e "${YELLOW}   Asegúrate de ejecutar este script desde el directorio envs/docker${NC}"
    exit 1
fi

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    echo -e "${YELLOW}   Por favor, inicia Docker y vuelve a intentar${NC}"
    exit 1
fi

if [ "$MODE" == "dev" ]; then
    echo -e "${BLUE}🚀 Iniciando contenedores Docker (modo desarrollo)...${NC}"
    
    # Verificar si las imágenes existen
    if ! docker image inspect dashboard-api:latest > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  La imagen dashboard-api:latest no existe${NC}"
        echo -e "${YELLOW}   Ejecuta './setup.sh dev api' primero para construir la imagen${NC}"
        exit 1
    fi

    if ! docker image inspect dashboard-frontend:latest > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  La imagen dashboard-frontend:latest no existe${NC}"
        echo -e "${YELLOW}   Ejecuta './setup.sh dev dashboard' primero para construir la imagen${NC}"
        exit 1
    fi

    # Iniciar los contenedores de desarrollo
    export COMPOSE_PROJECT_NAME=dashaboard-users-posts
    docker-compose up -d

    echo -e "${GREEN}✅ Contenedores iniciados exitosamente${NC}"
    echo ""
    echo -e "${BLUE}📊 Servicios disponibles:${NC}"
    echo -e "   • Dashboard Frontend: ${GREEN}http://localhost:5173${NC}"
    echo -e "   • API Backend: ${GREEN}http://localhost:3001${NC}"
    echo -e "   • MongoDB: ${GREEN}localhost:27018${NC}"
    echo ""
    echo -e "${BLUE}📝 Comandos útiles:${NC}"
    echo -e "   • Ver logs: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "   • Detener contenedores: ${YELLOW}docker-compose down${NC}"
    echo -e "   • Ver estado: ${YELLOW}docker-compose ps${NC}"
    echo ""

elif [ "$MODE" == "build" ]; then
    echo -e "${BLUE}🚀 Iniciando contenedores Docker (modo producción)...${NC}"
    
    # Verificar si las imágenes existen
    if ! docker image inspect dashboard-api-prod:latest > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  La imagen dashboard-api-prod:latest no existe${NC}"
        echo -e "${YELLOW}   Ejecuta './setup.sh build api' primero para construir la imagen${NC}"
        exit 1
    fi

    if ! docker image inspect dashboard-frontend-prod:latest > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  La imagen dashboard-frontend-prod:latest no existe${NC}"
        echo -e "${YELLOW}   Ejecuta './setup.sh build dashboard' primero para construir la imagen${NC}"
        exit 1
    fi

    # Iniciar los contenedores de producción
    export COMPOSE_PROJECT_NAME=dashboard-users-posts-prod
    docker-compose -f docker-compose.prod.yml up -d

    echo -e "${GREEN}✅ Contenedores iniciados exitosamente${NC}"
    echo ""
    echo -e "${BLUE}📊 Servicios disponibles:${NC}"
    echo -e "   • Dashboard Frontend: ${GREEN}http://localhost:8080${NC}"
    echo -e "   • API Backend: ${GREEN}http://localhost:3002${NC}"
    echo -e "   • MongoDB: ${GREEN}localhost:27019${NC}"
    echo ""
    echo -e "${BLUE}📝 Comandos útiles:${NC}"
    echo -e "   • Ver logs: ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"
    echo -e "   • Detener contenedores: ${YELLOW}docker-compose -f docker-compose.prod.yml down${NC}"
    echo -e "   • Ver estado: ${YELLOW}docker-compose -f docker-compose.prod.yml ps${NC}"
    echo ""

else
    echo -e "${YELLOW}⚠️  Modo inválido: $MODE${NC}"
    echo -e "${YELLOW}   Uso: ./start.sh [dev|build]${NC}"
    echo -e "${YELLOW}   - dev: Modo desarrollo (por defecto)${NC}"
    echo -e "${YELLOW}   - build: Modo producción${NC}"
    exit 1
fi

