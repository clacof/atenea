#!/bin/bash

# ATENEA Tunnel Manager
# Gestiona el túnel de VS Code para compartir la aplicación

TUNNEL_PID_FILE="/tmp/atenea-tunnel.pid"
TUNNEL_LOG="/tmp/atenea-tunnel.log"

start_tunnel() {
    echo "🔧 Iniciando túnel para ATENEA..."
    
    # Matar tunnels anteriores
    if [ -f "$TUNNEL_PID_FILE" ]; then
        kill $(cat "$TUNNEL_PID_FILE") 2>/dev/null
        rm "$TUNNEL_PID_FILE"
    fi
    
    # Crear túnel con localtunnel
    echo "⏳ Por favor espera 3-5 segundos..."
    
    nohup lt --port 3000 2>&1 > "$TUNNEL_LOG" &
    echo $! > "$TUNNEL_PID_FILE"
    
    # Esperar a que se genere el túnel
    sleep 5
    
    # Leer el URL
    TUNNEL_URL=$(grep -o "https://[a-z0-9\.\-]*" "$TUNNEL_LOG" | head -1)
    
    if [ -n "$TUNNEL_URL" ]; then
        echo ""
        echo "✅ ¡Túnel creado exitosamente!"
        echo ""
        echo "🔗 URL PÚBLICO:"
        echo "   $TUNNEL_URL"
        echo ""
        echo "📋 Credenciales:"
        echo "   📧 admin@atenea.com"
        echo "   🔐 admin123"
        echo ""
        echo "💾 URL guardado en: $TUNNEL_LOG"
        echo ""
        echo "⏹️  Para detener el túnel:"
        echo "   bash tunnel.sh stop"
        
        # Guardar URL en archivo
        echo "$TUNNEL_URL" > /tmp/atenea-tunnel-url.txt
    else
        echo "❌ Error: No se pudo crear el túnel"
        echo "Log: $TUNNEL_LOG"
        cat "$TUNNEL_LOG"
    fi
}

stop_tunnel() {
    if [ -f "$TUNNEL_PID_FILE" ]; then
        PID=$(cat "$TUNNEL_PID_FILE")
        kill $PID 2>/dev/null
        rm "$TUNNEL_PID_FILE"
        echo "✅ Túnel detenido (PID: $PID)"
    else
        echo "ℹ️  No hay túnel activo"
    fi
}

status_tunnel() {
    if [ -f "$TUNNEL_PID_FILE" ]; then
        PID=$(cat "$TUNNEL_PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            echo "✅ Túnel activo (PID: $PID)"
            if [ -f /tmp/atenea-tunnel-url.txt ]; then
                echo "URL: $(cat /tmp/atenea-tunnel-url.txt)"
            fi
        else
            echo "❌ Túnel no activo (PID inválido)"
        fi
    else
        echo "❌ Sin túnel activo"
    fi
}

case "${1:-start}" in
    start)
        start_tunnel
        ;;
    stop)
        stop_tunnel
        ;;
    status)
        status_tunnel
        ;;
    restart)
        stop_tunnel
        sleep 2
        start_tunnel
        ;;
    *)
        echo "Uso: tunnel.sh [start|stop|status|restart]"
        exit 1
        ;;
esac
