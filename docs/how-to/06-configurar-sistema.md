# Cómo Configurar el Sistema

Parámetros operativos, categorías y usuarios.

**Audiencia:** Administradores
**Duración:** 20 minutos

---

## 1. Panel de Configuración

### 1.1 Acceder

1. Inicia sesión como administrador
2. Ve a **Config** en el menú

### 1.2 Secciones

| Sección | Descripción |
|---------|-----------|
| General | Parámetros de negocio |
| Categorías | Productos y precios |
| Usuarios | Gestión de operadores |
| Sistema | Configuración técnica |

---

## 2. Parámetros Generales

### 2.1 Ubicación

En **Config** → **Parámetros**

### 2.2 Parámetros disponibles

| Parámetro | Descripción | Ejemplo |
|----------|-----------|--------|
| `horaCambioAfter` | Inicio afterhour | "04:00" |
| `maxChicasBottella` | Chicas máx. por botella | 2 |
| `minValor150k` | Umbral para 150k+ | 150000 |
| `comisionNormalFija` | Comisión estándar | 5000 |
| `comisionPremiumFija` | Comisión premium | 8000 |
| `comisionAcompananteBotella` | Por acompañante | 5000 |

### 2.3 Editar parámetro

1. Busca el parámetro
2. Haz clic en **Editar**
3. Ingresa el nuevo valor
4. Guarda

---

## 3. Configurar Afterhour

### 3.1 Qué es afterhour

**Afterhour** es el período fuera del horario normal donde:

- Los tragos no generan comisión para chicas
- Es tiempo de la casa

### 3.2 Configurar hora

1. Ve a **Config** → **General**
2. Edita `horaCambioAfter`
3. Ingresa la hora en formato HH:mm
4. Guarda

```
horaCambioAfter: "04:00"
```

A partir de las 4:00 AM, los tragos no generan comisión.

### 3.3 Marcar categoría afterhour

1. Ve a **Categorías**
2. Edita o crea categoría
3. Marca **isAfterhour**
4. Guarda

---

## 4. Gestionar Categorías

### 4.1 Tipos de categoría

| Tipo | Descripción |
|------|----------|
| `trago` | Bebidas individuales |
| `botella` | Botellas completas |

### 4.2 Crear categoría (trago)

1. Ve a **Categorías**
2. Haz clic en **Nueva**
3. Completa:

| Campo | Valor ejemplo |
|-------|--------------|
| Nombre | Vodka |
| Tipo | trago |
| Precio cliente | 12000 |
| Precio chica | 6000 |
| Comisión | 4000 |
| Activa | ✓ |

### 4.3 Crear categoría (botella)

| Campo | Valor ejemplo |
|-------|--------------|
| Nombre | Grey Goose |
| Tipo | botella |
| Precio | 85000 |
| Comisión | 20000 |
| Recargo crédito | 2000 |

### 4.4 Categoría solo transferencia

Para botellas de alto valor:

1. Crea/edita categoría
2. Marca **Solo Transferencia**
3. Guarda

El operador no podrá cobrar efectivo ni débito para esta categoría.

---

## 5. Comisiones

### 5.1 Por categoría

En **Categorías**, cada producto tiene:

| Campo | Descripción |
|-------|-------------|
| Comisión | Monto base de comisión |

### 5.2 Cálculo de comisión

| Situación | Cálculo |
|----------|---------|
| Trago + Cliente | Sin comisión |
| Botella + Cliente | Comisión ÷ número de chicas |
| Chica consume | Comisión completa |

### 5.3 Configuración por volumen

```
porcBottella100k: 20
porcBottella150kMas: 25
minValor150k: 150000
```

| Precio botella | Comisión |
|--------------|----------|
| < $150,000 | 20% del precio |
| ≥ $150,000 | 25% del precio |

---

## 6. Gestionar Usuarios

### 6.1 Roles

| Rol | Permisos |
|-----|----------|
| `admin` | Total acceso |
| `supervisor` | Gestión + reportes |
| `caja` | Solo caja y reportes |

### 6.2 Crear usuario

1. Ve a **Usuarios** (menú admin)
2. Haz clic en **Nuevo**
3. Completa:

| Campo | Descripción |
|-------|-----------|
| Nombre | Nombre completo |
| Email | Correo único |
| Contraseña | Contraseña inicial |
| Rol | admin/supervisor/caja |

### 6.3 Editar usuario

1. Ve a **Usuarios**
2. Selecciona el usuario
3. Edita campos necesarios
4. Cambia contraseña si es necesario

### 6.4 Desactivar usuario

Para desactivar sin eliminar:

1. Edita el usuario
2. Desmarca **Activo**
3. El usuario no podrá iniciar sesión

---

## 7. Configuración de Chicas

### 7.1 Parámetros

En **Config** → **General**:

| Parámetro | Descripción |
|-----------|-------------|
| maxChicasBottella | 2 |

### 7.2 Editar parámetro

1. Busca `maxChicasBottella`
2. Cambia el valor
3. Guarda

---

## 8. Configuración de Pagos

### 8.1 Recargos

En **Categorías**, configura recargo por crédito:

| Campo | Descripción |
|-------|------------|
| Recargo crédito cliente | Recargo para pagos con crédito |
| Recargo crédito chica | Recargo para consumo de chica |

### 8.2 Límites

En **Config** → **General**:

| Parámetro | Descripción |
|-----------|-------------|
| maxTransferencia | Límite máximo por operación |
| minEfectivo | Mínimo para pago en efectivo |

---

## 9. Ciclos de Trabajo

### 9.1 Configurar ciclos

Los ciclos permiten separar la jornada en bloques:

1. Ve a **Config** → **Ciclos**
2. Crea ciclo:

| Campo | Valor |
|-------|-------|
| Nombre | Mañana |
| Hora inicio | 06:00 |
| Hora fin | 14:00 |

### 9.2 Ciclos predefinidos

| Ciclo | Horario |
|-------|--------|
| Mañana | 06:00 - 14:00 |
| Tarde | 14:00 - 21:00 |
| Noche | 21:00 - 06:00 |

---

## 10. Respaldo y Restauración

### 10.1 Exportar datos

1. Ve a **Config** → **Respaldo**
2. Haz clic en **Exportar**
3. Descarga el archivo JSON

### 10.2 Importar datos

1. Ve a **Config** → **Restaurar**
2. Selecciona archivo
3. Confirma la importación
4. Los datos actuales se reemplazan

---

## Checklist de Configuración

- [ ] Configurar hora de afterhour
- [ ] Crear categorías base (tragos y botellas)
- [ ] Configurar comisiones
- [ ] Crear usuarios operadores
- [ ] Configurar recargos por crédito
- [ ] Probar flujo completo

---

*Última actualización: Abril 2026*