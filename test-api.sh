#!/bin/bash

# Testing Script for ATENEA Night Club API
# Este script prueba todos los endpoints y funcionalidades del sistema

BASE_URL="http://localhost:3000/api"
ADMIN_EMAIL="admin@atenea.com"
ADMIN_PASSWORD="admin123"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir resultados
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ $2${NC}"
  else
    echo -e "${RED}✗ $2${NC}"
  fi
}

# Obtener token
echo "====== OBTENER TOKEN ======"
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}✗ No se pudo obtener token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Token obtenido: ${TOKEN:0:30}...${NC}"

# Función auxiliar para hacer requests
api_get() {
  curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL$1" | jq '.'
}

api_post() {
  curl -s -X POST -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$2" "$BASE_URL$1" | jq '.'
}

api_put() {
  curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$2" "$BASE_URL$1" | jq '.'
}

api_patch() {
  curl -s -X PATCH -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$2" "$BASE_URL$1" | jq '.'
}

api_delete() {
  curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$BASE_URL$1" | jq '.'
}

# ====== TEST: CATEGORÍAS ======
echo -e "\n${YELLOW}====== CATEGORÍAS ======${NC}"

# GET categorías
CATEGORIAS=$(api_get "/categorias")
CATS_COUNT=$(echo $CATEGORIAS | jq 'length')
test_result $? "GET /api/categorias (encontradas: $CATS_COUNT)"

# GET categoría específica
CATEGORIA=$(api_get "/categorias/1")
CAT_NAME=$(echo $CATEGORIA | jq -r '.nombre')
test_result $? "GET /api/categorias/1 ($CAT_NAME)"

# ====== TEST: CHICAS ======
echo -e "\n${YELLOW}====== CHICAS ======${NC}"

# GET chicas
CHICAS=$(api_get "/chicas")
CHICAS_COUNT=$(echo $CHICAS | jq 'length')
test_result $? "GET /api/chicas (encontradas: $CHICAS_COUNT)"

# GET chica específica
CHICA=$(api_get "/chicas/1")
CHICA_NAME=$(echo $CHICA | jq -r '.nombre')
test_result $? "GET /api/chicas/1 ($CHICA_NAME)"

# ====== TEST: COMANDAS ======
echo -e "\n${YELLOW}====== COMANDAS ======${NC}"

# POST crear comanda
NUEVA_COMANDA='{
  "categoriaId": 1,
  "tipoConsumo": "chica",
  "chica1Id": 1,
  "chica2Id": null,
  "descuentoPorcentaje": null,
  "descuentoMonto": null,
  "cortesia": false,
  "medioPago": "efectivo"
}'

COMANDA=$(api_post "/comandas" "$NUEVA_COMANDA")
COMANDA_ID=$(echo $COMANDA | jq -r '.id')
test_result $? "POST /api/comandas (creada: $COMANDA_ID)"

# GET comanda específica
COMANDA_GET=$(api_get "/comandas/$COMANDA_ID")
COMANDA_ESTADO=$(echo $COMANDA_GET | jq -r '.estado')
test_result $? "GET /api/comandas/$COMANDA_ID (estado: $COMANDA_ESTADO)"

# PATCH comanda (cambiar estado)
UPDATE_COMANDA='{
  "estado": "anulada"
}'
COMANDA_PATCH=$(api_patch "/comandas/$COMANDA_ID" "$UPDATE_COMANDA")
ESTADO_NUEVO=$(echo $COMANDA_PATCH | jq -r '.estado')
test_result $? "PATCH /api/comandas/$COMANDA_ID (nuevo estado: $ESTADO_NUEVO)"

# DELETE comanda
COMANDA_DEL=$(api_delete "/comandas/$COMANDA_ID")
DEL_MSG=$(echo $COMANDA_DEL | jq -r '.message')
test_result $? "DELETE /api/comandas/$COMANDA_ID ($DEL_MSG)"

# ====== TEST: CAJA/TURNO ======
echo -e "\n${YELLOW}====== CAJA TURNO ======${NC}"

# GET caja turno
CAJA=$(api_get "/caja/turno")
TOTAL=$(echo $CAJA | jq '.totalGeneral')
test_result $? "GET /api/caja/turno (total: \$$TOTAL)"

# ====== TEST: REPORTES ======
echo -e "\n${YELLOW}====== REPORTES ======${NC}"

# GET reportes
REPORTES=$(api_get "/reportes")
REPORT_TOTAL=$(echo $REPORTES | jq '.resumen.totalVentas')
test_result $? "GET /api/reportes (totalVentas: \$$REPORT_TOTAL)"

# ====== TEST: CONFIGURACIÓN ======
echo -e "\n${YELLOW}====== CONFIGURACIÓN ======${NC}"

# GET config
CONFIG=$(api_get "/config")
MAX_CHICAS=$(echo $CONFIG | jq '.maxChicasBottella')
test_result $? "GET /api/config (maxChicasBottella: $MAX_CHICAS)"

# PUT config (actualizar)
UPDATE_CONFIG='{
  "maxChicasBottella": 4,
  "porcBottella100k": 0.42
}'
CONFIG_UPDATE=$(api_put "/config" "$UPDATE_CONFIG")
MAX_ACTUAL=$(echo $CONFIG_UPDATE | jq '.maxChicasBottella')
test_result $? "PUT /api/config (maxChicasBottella: $MAX_ACTUAL)"

# ====== TEST: AUTENTICACIÓN ======
echo -e "\n${YELLOW}====== AUTENTICACIÓN ======${NC}"

# Login válido
LOGIN_OK=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.token')

if [ ! -z "$LOGIN_OK" ] && [ "$LOGIN_OK" != "null" ]; then
  test_result 0 "Login con credenciales correctas"
else
  test_result 1 "Login con credenciales correctas"
fi

# Login inválido
LOGIN_BAD=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"wrongpassword\"}" | jq -r '.error')

if [ ! -z "$LOGIN_BAD" ] && [ "$LOGIN_BAD" != "null" ]; then
  test_result 0 "Rechazo de credenciales inválidas"
else
  test_result 1 "Rechazo de credenciales inválidas"
fi

# Request sin token
NO_TOKEN=$(curl -s -H "Authorization: Bearer invalid-token" "$BASE_URL/categorias" | jq -r '.error')
if [ ! -z "$NO_TOKEN" ] && [ "$NO_TOKEN" != "null" ]; then
  test_result 0 "Rechazo de token inválido"
else
  test_result 1 "Rechazo de token inválido"
fi

# ====== TEST: VALIDACIONES ======
echo -e "\n${YELLOW}====== VALIDACIONES ======${NC}"

# Comanda sin categoría (debe fallar)
COMANDA_INVALID='{
  "tipoConsumo": "chica",
  "chica1Id": 1,
  "medioPago": "efectivo"
}'
COMANDA_FAIL=$(api_post "/comandas" "$COMANDA_INVALID")
ERROR=$(echo $COMANDA_FAIL | jq -r '.error')

if [ ! -z "$ERROR" ] && [ "$ERROR" != "null" ]; then
  test_result 0 "Validación: rechazo de comanda sin categoría"
else
  test_result 1 "Validación: rechazo de comanda sin categoría"
fi

echo -e "\n${GREEN}====== TESTING COMPLETADO =====${NC}"
