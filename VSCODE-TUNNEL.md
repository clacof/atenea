#!/bin/bash

# ATENEA - VS Code Tunnel Sharing
# ================================
# Método 1: VS Code Port Forwarding (RECOMENDADO - Interfaz Gráfica)
# Método 2: VS Code Remote Tunnels (CLI)

echo "🔗 ATENEA - Compartir vía VS Code"
echo "===================================="
echo ""

cat << 'EOF'

📖 MÉTODO 1: Port Forwarding en VS Code (INTERFAZ)
═══════════════════════════════════════════════════

1. En VS Code, abre la TERMINAL (menú View > Terminal)
   Asegúrate de que ya está corriendo:
   $ npm run dev

2. Localiza el panel "PORTS" (pestaña inferior junto a Terminal)
   Si no ves "PORTS", haz clic en el ícono de +
   
3. Verás el puerto 3000 listado (si no, haz clic en "Forward a Port")
   
4. Haz clic en el icono 🔗 (Share Port) junto al puerto 3000
   
5. Se abrirá un URL público como:
   🌐 https://claudioxxx-3000.devtunnels.ms/
   
6. Copia ese link y compartelo con otros

═══════════════════════════════════════════════════════════════════

📜 MÉTODO 2: VS Code Tunnels (Línea de Comandos)
═══════════════════════════════════════════════════

Opción A - Usar la CLI de VS Code (requiere tener 'code' disponible):

  code tunnel --accept-server-license-terms --name atenea-share

Opción B - Via CLI Helper Script (ver menú abajo)

═══════════════════════════════════════════════════════════════════

⚡ MÉTODO 3: GitHub Codespaces (Si usas GitHub)
═════════════════════════════════════════════════

Si tu proyecto está en GitHub:

1. Abre en GitHub: https://github.com/[usuario]/[repo]
2. Presiona "." (punto) para abrir GitHub Codespace
3. Ejecuta: npm run dev
4. El puerto será compartido automáticamente

═══════════════════════════════════════════════════════════════════

✅ MÉTODO RECOMENDADO: Port Forwarding de VS Code

Ventajas:
  ✓ Interfaz de usuario intuitiva
  ✓ URL segura con token
  ✓ Control granular de permisos
  ✓ Sin instalar herramientas extras
  ✓ Se genera automáticamente con cada forward

Pasos resumidos:
  1. Terminal visible con "npm run dev"
  2. Panel "PORTS" (abajo)
  3. Click 🔗 "Share Port"
  4. Copia el URL
  5. ¡Listo! Otros pueden acceder

═══════════════════════════════════════════════════════════════════

EU

read -p "Presiona ENTER para continuar..."
