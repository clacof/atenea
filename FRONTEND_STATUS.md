# Frontend Status - ATENEA

## Estado General

Frontend operativo y conectado a APIs reales.

## Paginas Activas

- /login
- /dashboard
- /dashboard/comandas
- /dashboard/comandas/nueva
- /dashboard/turno
- /dashboard/chicas
- /dashboard/categorias
- /dashboard/caja
- /dashboard/reportes
- /dashboard/config

## Integraciones Confirmadas

- Login con cookie httpOnly
- Turno activo con refresco periodico
- Nueva comanda con:
  - cliente nuevo o existente
  - correlativo diario Cn
  - disponibilidad de chicas
  - delta para botella con acompanantes
  - resumen acumulado por cliente
- Categorias con flag afterhour
- Configuracion con comisionAcompananteBotella

## UX/UI Reciente

- Caja de clientes activos en turno no colapsa en estado vacio
- Mayor espaciado en panel de disponibilidad
- Estados de carga y error en pantallas criticas

## Pendientes Sugeridos

- Skeletons visuales en tablas
- Paginacion en listados grandes
- Mejoras de accesibilidad (teclado y contraste)
- Tests e2e para flujo de comanda y cierre de cuenta

## Riesgos Conocidos

- En desarrollo con Turbopack pueden aparecer errores de chunk por cache corrupta
- Requiere limpieza de .next cuando ocurre inconsistencia de bundles

## Fecha de actualizacion

19-03-2026