#!/bin/bash

echo "Iniciando setup de Supabase para reciclame-mobile-app"
echo ""

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado. Por favor instala Docker Desktop"
    exit 1
fi

echo "OK: Docker encontrado"
echo ""

echo "Instalando dependencias..."
npm install

echo ""
echo "Iniciando Supabase local..."
npm run db:start

echo ""
echo "OK: Setup completado!"
echo ""
echo "URLs disponibles:"
echo "  API:    http://127.0.0.1:54321"
echo "  Studio: http://127.0.0.1:54323"
echo "  DB:     postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo "Copia el anon key que aparece arriba al archivo docker/.env.local"
echo "  EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>"
echo ""
