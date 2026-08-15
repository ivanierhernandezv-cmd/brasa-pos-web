#!/bin/bash

# Full Track POS - Web Version Startup Script (Mac/Linux)

echo ""
echo "╔════════════════════════════════════════╗"
echo "║     Full Track POS - Web Version      ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error instalando dependencias"
        exit 1
    fi
fi

echo ""
echo "Iniciando servidor..."
echo ""

npm start
