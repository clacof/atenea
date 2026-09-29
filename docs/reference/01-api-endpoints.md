# Referencia de API Endpoints

Documentación técnica de todos los endpoints de ATENEA.

**Audiencia:** Desarrolladores, integradores
**Versión del API:** 1.0

---

## Autenticación

### Headers requeridos

Todos los endpoints requieren autenticación JWT via cookie:

```
Cookie: token=<jwt_token>
```

### Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Error de validación |
| 401 | No autorizado |
| 403 | Acceso denegado |
| 404 | No encontrado |
| 409 | Conflicto |
| 500 | Error interno |

---

## Auth

### POST /api/auth/login

Inicia sesión de usuario.

**Request:**
```json
{
  "email": "admin@atenea.com",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": 1,
    "nombre": "Administrador",
    "email": "admin@atenea.com",
    "rol": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST /api/auth/logout

Cierra sesión.

**Response 200:**
```json
{
  "message": "Sesion cerrada"
}
```

---

## Comandas

### GET /api/comandas

Lista todas las comandas.

**Query params:**
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| limit | number | 200 | Límite de resultados (máx 500) |
| page | number | 1 | Página |

**Response 200:**
```json
[
  {
    "id": 1,
    "fecha": "2026-04-24T22:30:00.000Z",
    "hora": "22:30:00",
    "categoria": { "id": 1, "nombre": "Cerveza", "tipo": "trago" },
    "tipoConsumo": "cliente",
    "chica1": { "id": 1, "nombre": "María G." },
    "chica2": null,
    "precioBase": 8000,
    "precioFinal": 8000,
    "comisionTotal": 0,
    "comisionChica1": 0,
    "comisionChica2": 0,
    "descuentoPorcentaje": null,
    "descuentoMonto": null,
    "cortesia": false,
    "medioPago": "efectivo",
    "estado": "pagada",
    "clienteNombre": "C1",
    "usuario": { "nombre": "Juan Pérez" }
  }
]
```

---

### POST /api/comandas

Crea una nueva comanda.

**Request:**
```json
{
  "categoriaId": 1,
  "tipoConsumo": "cliente",
  "chica1Id": 1,
  "chica2Id": null,
  "chicaRecibeComisionId": 1,
  "chicasAdicionalesBotella": 0,
  "descuentoPorcentaje": 10,
  "descuentoMonto": null,
  "cortesia": false,
  "medioPago": "efectivo",
  "clienteNombre": "C1"
}
```

**Campos requeridos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| categoriaId | number | ID de categoría |
| tipoConsumo | string | "cliente" o "chica" |
| medioPago | string | Efectivo, transferencia, debito, credito |
| clienteNombre | string | Formato C1, C2, C3... |

**Campos opcionales:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| chica1Id | number | Primera chica |
| chica2Id | number | Segunda chica |
| chicaRecibeComisionId | number | Quién recibe comisión |
| chicasAdicionalesBotella | number | Acompañantes extra |
| descuentoPorcentaje | number | 0-100 |
| descuentoMonto | number | Monto fijo |
| cortesia | boolean | Consumo gratuito |

**Response 201:**
```json
{
  "id": 15,
  "fecha": "2026-04-24T22:30:00.000Z",
  "categoria": { "nombre": "Cerveza" },
  "precioFinal": 7200,
  "comisionTotal": 0,
  ...
}
```

**Errores comunes:**
| Error | Código | Causa |
|-------|--------|-------|
| Categoria es requerida | 400 | Falta categoriaId |
| Chica esta ocupada | 409 | Chica en otra comanda activa |
| Para botellas se requieren al menos 2 chicas | 400 | Botella sin suficientes chicas |

---

### GET /api/comandas/:id

Obtiene una comanda por ID.

**Response 200:**
```json
{
  "id": 1,
  "categoria": { "nombre": "Cerveza" },
  "chica1": { "nombre": "María G." },
  "precioFinal": 8000,
  ...
}
```

---

### PATCH /api/comandas/:id

Actualiza el estado de una comanda.

**Request:**
```json
{
  "estado": "pagada"
}
```

**Estados válidos:** `activa`, `pagada`, `anulada`

**Response 200:**
```json
{
  "id": 1,
  "estado": "pagada",
  ...
}
```

---

### DELETE /api/comandas/:id

Anula una comanda.

**Response 200:**
```json
{
  "message": "Comanda anulada"
}
```

> **Nota:** Solo admins y supervisores pueden anular.

---

### GET /api/comandas/turno-activo

Lista clientes y comandas del turno activo.

**Response 200:**
```json
{
  "clientes": [
    {
      "clienteNombre": "C1",
      "comandas": [
        { "id": 1, "categoria": "Cerveza", "precioFinal": 8000 }
      ],
      "subtotal": 8000
    }
  ],
  "totales": {
    "efectivo": 450000,
    "transferencia": 280000,
    "debito": 120000,
    "credito": 42000
  }
}
```

---

## Categorías

### GET /api/categorias

Lista todas las categorías activas.

**Response 200:**
```json
[
  {
    "id": 1,
    "nombre": "Cerveza",
    "tipo": "trago",
    "isAfterhour": false,
    "precioCliente": 8000,
    "precioChica": 4000,
    "comisionChica": 3000,
    "recargoCreditoCliente": 500,
    "recargoCreditoChica": 300,
    "soloTransferencia": false,
    "activa": true
  }
]
```

---

### POST /api/categorias

Crea una categoría.

**Request:**
```json
{
  "nombre": "Whisky 12 años",
  "tipo": "botella",
  "precio": 150000,
  "comision": 30000,
  "recargoCreditoCliente": 2000,
  "soloTransferencia": false
}
```

---

### PUT /api/categorias/:id

Actualiza una categoría.

**Request:** Mismos campos que POST

---

### DELETE /api/categorias/:id

Desactiva una categoría.

---

## Chicas

### GET /api/chicas

Lista chicas activas con disponibilidad.

**Response 200:**
```json
[
  {
    "id": 1,
    "nombre": "María G.",
    "activa": true,
    "disponible": true
  },
  {
    "id": 2,
    "nombre": "Laura P.",
    "activa": true,
    "disponible": false
  }
]
```

---

### POST /api/chicas

Crea una chica.

**Request:**
```json
{
  "nombre": "Sofía R."
}
```

---

### PUT /api/chicas/:id

Actualiza una chica.

**Request:**
```json
{
  "nombre": "Sofía Actualizado",
  "activa": true
}
```

---

### DELETE /api/chicas/:id

Desactiva una chica.

---

## Caja

### GET /api/caja/turno

Obtiene resumen de caja del turno.

**Response 200:**
```json
{
  "fecha": "2026-04-24",
  "turno": "Noche",
  "totalEfectivo": 450000,
  "totalTransferencia": 280000,
  "totalDebito": 120000,
  "totalCredito": 42000,
  "totalGeneral": 892000,
  "responsable": "Juan Pérez"
}
```

---

### POST /api/caja/turno

Abre o cierra turno de caja.

**Request:**
```json
{
  "accion": "abrir",
  "responsable": "Juan Pérez"
}
```

**Acciones:** `abrir`, `cerrar`

---

## Reportes

### GET /api/reportes

Reporte general.

**Query params:**
| Param | Descripción |
|-------|-----------|
| fechaInicio | YYYY-MM-DD |
| fechaFin | YYYY-MM-DD |

**Response 200:**
```json
{
  "fecha": "2026-04-24",
  "totalVentas": 2140000,
  "comisiones": 234000,
  "comandas": {
    "total": 45,
    "pagadas": 42,
    "anuladas": 3
  },
  "porCategoria": [
    { "nombre": "Cerveza", "ventas": 680000 }
  ],
  "porMedioPago": {
    "efectivo": 980000,
    "transferencia": 780000,
    "debito": 280000,
    "credito": 100000
  }
}
```

---

## Configuración

### GET /api/config

Obtiene configuración del sistema.

**Response 200:**
```json
{
  "horaCambioAfter": "04:00",
  "maxChicasBottella": 2,
  "comisionNormalFija": 5000,
  "comisionPremiumFija": 8000,
  "comisionAcompananteBotella": 5000
}
```

---

### PUT /api/config

Actualiza configuración.

**Request:**
```json
{
  "horaCambioAfter": "05:00",
  "maxChicasBottella": 3
}
```

---

## Stats

### GET /api/stats

Estadísticas en tiempo real.

**Response 200:**
```json
{
  "comandasActivas": 12,
  "clientesAbiertos": 5,
  "chicasDisponibles": 8,
  "ventasHoy": 892000
}
```

---

## Health

### GET /api/health

Verifica estado del sistema.

**Response 200:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-04-24T22:30:00.000Z"
}
```

---

## Utilidades (Dev)

### POST /api/seed

Recarga datos de prueba.

> **Solo en desarrollo.**

---

### POST /api/setup

Reinicializa base de datos.

> **Solo en desarrollo.**

---

*Última actualización: Abril 2026*