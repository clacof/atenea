# Roadmap de mejoras — Atenea

Actualizado: 2026-09-29

Prioridad: **P1** = impacto directo en operación/dinero · **P2** = calidad y control · **P3** = comodidad.

## Fase 1 — Chicas

- [x] Edición de chicas para admin y supervisor; eliminar solo admin.
- [x] Estado activa/ausente editable desde el modal de edición.
- [x] **P1** Nombres duplicados bloqueados (sin distinguir mayúsculas, en `POST` y `PUT`, ignora archivadas).
- [x] **P1** "Eliminar" archiva automáticamente si la chica tiene comandas; se puede restaurar. Archivada = nunca disponible para comandas.
- [x] **P2** Campos extra: alias, teléfono, notas internas, fecha de ingreso editable (migración `20260929120000_chica_ficha_y_auditoria`).
- [x] **P2** Búsqueda (nombre, alias, teléfono; ignora tildes) y filtro Todas / Activas / Ausentes / Archivadas.
- [x] **P2** Ficha por chica (`/dashboard/chicas/[id]`): comisión del turno y del mes, promedio, notas, últimas 50 comandas con estado y liberaciones.
- [ ] **P3** Foto opcional. Pendiente: requiere almacenamiento de archivos (ej. Vercel Blob); guardarla en la base haría pesada la vista de turno, que se refresca seguido.
- [x] **P3** Acciones masivas: seleccionar varias y marcar ausentes/activas.

## Fase 2 — Control y auditoría

- [x] **P1** `AuditLog` registra altas, ediciones (con valores antes → después), cambios de estado, archivado y eliminación de chicas.
- [x] **P1** Auditoría de comandas (crear, pagar, anular, cierre de cuenta), liberación de chicas, cierre de caja, categorías, usuarios (sin registrar contraseñas) y configuración.
- [x] **P2** Vista `/dashboard/auditoria` (solo admin) con filtros por usuario, tabla, acción y fechas, detalle por fila y paginación.
- [x] **P2** Permisos centralizados en `lib/permissions.ts` (`can(rol, accion)`), usados por API, sidebar y páginas. Acceso denegado ahora responde 403.

## Fase 3 — Calidad técnica

- [x] **P1** Tests unitarios (vitest, `npm test`): reglas de comisión, reparto, permisos, schemas, helpers de chicas y exportación.
- [ ] **P1** Tests e2e (Playwright) para crear comanda → cerrar cuenta → caja. Pendiente: necesita una base de datos de prueba propia en CI (hoy `.env` apunta a la base real).
- [x] **P2** Validación con zod (`lib/schemas.ts`) en chicas, comandas, categorías (whitelist de campos: antes aceptaba cualquier campo), caja y auditoría. Usuarios y configuración mantienen su validación manual existente.
- [x] **P2** Rol del usuario desde el servidor (`/api/auth/me` + `useCurrentUser`) en vez de `localStorage`.
- [x] **P2** `confirm`/`alert` nativos reemplazados por diálogo de confirmación y toasts en toda la app.
- [x] **P3** Eliminado `mockData.ts`. `/api/seed` y `/api/setup` (borran toda la base, sin auth) bloqueados en producción y exigen `ALLOW_DB_RESET=1` en desarrollo.
- [x] Extra: Configuración tenía funciones simuladas. "Cambiar contraseña" ahora usa `/api/auth/password` y verifica la contraseña actual. "Logs" lleva a la auditoría real. Se quitó el "Backup" falso.

## Fase 4 — Operación y reportes

- [x] **P1** Ranking de chicas en reportes: posición, comandas, consumo generado, comisión y % del total.
- [x] **P2** Liquidación de comisiones por chica en PDF (con línea de firma) y Excel/CSV, con desglose diario en reporte semanal.
- [x] **P2** Paginación: tablas con paginación en cliente (chicas, comandas, ficha); comandas carga lotes de 200 con "cargar más antiguas". Skeleton de carga en tablas.
- [x] **P3** Accesibilidad: modales con foco atrapado, Escape y retorno de foco; filas expandibles operables con teclado; labels asociados a sus campos; ARIA corregido en `Select`.
- [ ] **P3** Cola offline de comandas en PWA/Electron. Pendiente: reintentar comandas sin conexión puede duplicar cobros; requiere IDs idempotentes en la API antes de implementarse.

## Detectado y pendiente de decisión

- Cualquier usuario puede anular comandas con `PATCH /api/comandas/[id]` (estado `anulada`), aunque `DELETE` exige admin/supervisor. Se dejó igual para no cambiar la operación, pero ahora pide confirmación y queda auditado.
- Botella con comisión impar: el redondeo paga $1 extra en total (test lo documenta).
- Next 16 marca `middleware.ts` como obsoleto (renombrar a `proxy.ts`).
