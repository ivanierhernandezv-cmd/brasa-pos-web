#!/bin/bash

# Full Track POS - Web Version Setup Script

echo "╔════════════════════════════════════════════╗"
echo "║  Full Track POS - Web Setup               ║"
echo "║  Sistema de Gestión para Food Trucks      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado."
    echo "   Descárgalo de: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js: $NODE_VERSION"

# Install dependencies
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencias instaladas"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Create .env if doesn't exist
echo ""
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✓ Archivo .env creado"
else
    echo "ℹ️  .env ya existe"
fi

# Create data directory
echo ""
echo "📁 Preparando directorio de datos..."
mkdir -p data
echo "✓ Directorio de datos listo"

# Summary
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  ✓ Instalación completada                 ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Para iniciar el servidor:"
echo "  npm start"
echo ""
echo "Luego accede en tu navegador:"
echo "  http://localhost:3000"
echo ""
