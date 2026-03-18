#!/bin/bash

# ATENEA - Share Application via Tunnel
# =====================================
# Script para compartir la aplicación con otras personas a través de un link público

echo "🌐 ATENEA Tunnel Sharing"
echo "========================"
echo ""

# Verificar que el servidor está corriendo
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Error: El servidor no está corriendo en http://localhost:3000"
    echo ""
    echo "Inicia el servidor primero:"
    echo "  npm run dev"
    exit 1
fi

echo "✅ Servidor detectado en puerto 3000"
echo ""
echo "Elige un método para compartir:"
echo ""
echo "1️⃣  Serveo.net (SSH, sin registro)"
echo "2️⃣  Localtunnel (npm, sin registro)"
echo "3️⃣  Exponerlo en tu IP local"
echo ""

read -p "Selecciona una opción (1-3): " option

case $option in
    1)
        echo ""
        echo "🔗 Iniciando túnel con serveo.net..."
        echo ""
        echo "Comando a ejecutar en otra terminal:"
        echo "─────────────────────────────────────"
        echo "ssh -R 80:localhost:3000 serveo.net"
        echo "─────────────────────────────────────"
        echo ""
        echo "O ejecuta directamente:"
        ssh -R 80:localhost:3000 serveo.net
        ;;
    
    2)
        echo ""
        echo "🔗 Instalando localtunnel..."
        npm install -g localtunnel 2>&1 | grep -E "(added|removed|up to date)" || echo "✅ Localtunnel listo"
        
        echo ""
        echo "Iniciando túnel..."
        lt --port 3000 --open false
        ;;
    
    3)
        echo ""
        echo "📱 Acceso local en tu red:"
        echo ""
        
        # Obtener IP local
        LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "127.0.0.1")
        
        echo "Comparte este link:"
        echo "  http://$LOCAL_IP:3000"
        echo ""
        echo "Otros dispositivos en la misma red pueden acceder con este link"
        echo ""
        read -p "Presiona ENTER para salir..."
        ;;
    
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac
