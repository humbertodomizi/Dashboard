#!/bin/bash

# Script para poblar la base de datos con datos iniciales
# Uso: ./populate.sh

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Iniciando proceso de población de base de datos...${NC}"

# Verificar si el contenedor de la API está corriendo
if ! docker ps --format '{{.Names}}' | grep -q "dashboard-api"; then
    echo -e "${RED}❌ Error: El contenedor dashboard-api no está corriendo${NC}"
    echo -e "${YELLOW}   Ejecuta './start.sh' primero para iniciar los servicios${NC}"
    exit 1
fi

# Ejecutar el seed dentro del contenedor
echo -e "${BLUE}📦 Ejecutando seed en el contenedor de la API...${NC}"
docker exec -it dashboard-api pnpm run seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos poblada exitosamente${NC}"
else
    echo -e "${RED}❌ Error al poblar la base de datos${NC}"
    exit 1
fi

