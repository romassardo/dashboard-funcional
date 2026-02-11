#!/bin/bash
# Script de deployment para Dashboard Funcional

set -e

echo "=========================================="
echo "  Dashboard Funcional - Deployment"
echo "=========================================="
echo ""

# Ir al directorio del proyecto
cd /var/www/dashboard-funcional

echo "✓ Directorio: $(pwd)"
echo ""

# Pull cambios desde Git
echo "📥 Actualizando código desde Git..."
git pull origin main
echo ""

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
echo ""

# Compilar backend TypeScript
echo "🔨 Compilando backend..."
npx tsc
echo ""

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install
echo ""

# Build del frontend
echo "🔨 Compilando frontend..."
npm run build
echo ""

# Reiniciar backend
echo "🔄 Reiniciando servicios..."
cd ../backend
pm2 restart dashboard-backend 2>/dev/null || echo "   PM2: iniciar manualmente"
echo ""

echo "=========================================="
echo "  ✅ Deployment completado exitosamente"
echo "=========================================="
echo ""
echo "URLs:"
echo "  Frontend: http://10.12.32.4/"
echo "  Backend API: http://10.12.32.4:3000"
echo ""
