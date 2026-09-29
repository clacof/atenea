import { z } from 'zod'
import { NextResponse } from 'next/server'

// ── Helpers ─────────────────────────────────────────────────────

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximo ${max} caracteres`)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional()

const idPositivo = z.coerce.number().int().positive()

/**
 * Valida un body JSON contra un schema. Devuelve los datos o una respuesta 400
 * con el primer error legible.
 */
export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T>; response?: never } | { data?: never; response: NextResponse }> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return { response: NextResponse.json({ error: 'JSON invalido' }, { status: 400 }) }
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    return { response: NextResponse.json({ error: issue?.message ?? 'Datos invalidos' }, { status: 400 }) }
  }
  return { data: result.data }
}

export function parseId(value: string): number | null {
  const result = idPositivo.safeParse(value)
  return result.success ? result.data : null
}

// ── Chicas ──────────────────────────────────────────────────────

const nombreChica = z
  .string({ error: 'El nombre es requerido' })
  .trim()
  .min(1, 'El nombre es requerido')
  .max(100, 'Maximo 100 caracteres')

export const chicaCreateSchema = z.object({
  nombre: nombreChica,
  alias: textoOpcional(100),
  telefono: textoOpcional(30),
  notas: textoOpcional(1000),
  activa: z.boolean().optional(),
  fechaIngreso: z.coerce.date().optional(),
})

export const chicaUpdateSchema = chicaCreateSchema
  .partial()
  .extend({ archivada: z.boolean().optional() })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'No se proporcionaron campos validos',
  })

export const chicaBulkSchema = z.object({
  ids: z.array(idPositivo).min(1, 'Selecciona al menos una chica').max(500),
  activa: z.boolean({ error: 'Estado requerido' }),
})

// ── Comandas ────────────────────────────────────────────────────

const idOpcional = idPositivo.nullable().optional()
const montoOpcional = z.coerce.number().min(0).nullable().optional()

export const comandaCreateSchema = z.object({
  categoriaId: z.coerce.number({ error: 'Categoria es requerida' }).int().positive('Categoria es requerida'),
  tipoConsumo: z.enum(['cliente', 'chica'], { error: 'Tipo de consumo es requerido' }),
  medioPago: z.enum(['efectivo', 'transferencia', 'debito', 'credito'], {
    error: 'Medio de pago es requerido',
  }),
  chica1Id: idOpcional,
  chica2Id: idOpcional,
  chicaRecibeComisionId: idOpcional,
  chicasAdicionalesBotella: z.coerce.number().int().optional(),
  descuentoPorcentaje: z.coerce.number().min(0).max(100).nullable().optional(),
  descuentoMonto: montoOpcional,
  cortesia: z.boolean().optional(),
  clienteNombre: z.string({ error: 'El cliente es requerido y debe tener formato C1, C2, C3...' }),
})

export const comandaEstadoSchema = z.object({
  estado: z.enum(['activa', 'pagada', 'anulada'], { error: 'Estado invalido' }),
})

// ── Categorias ──────────────────────────────────────────────────

const precio = z.coerce.number().int('Debe ser un entero').min(0, 'No puede ser negativo').nullable().optional()

const categoriaBase = z.object({
  nombre: z.string({ error: 'Faltan datos requeridos' }).trim().min(1, 'Faltan datos requeridos').max(100),
  tipo: z.enum(['trago', 'botella'], { error: 'Faltan datos requeridos' }),
  isAfterhour: z.boolean().optional(),
  soloTransferencia: z.boolean().optional(),
  activa: z.boolean().optional(),
  precioCliente: precio,
  precioChica: precio,
  comisionChica: precio,
  precio,
  comision: z.coerce
    .number({ error: 'La comisión es requerida y debe ser mayor o igual a 0' })
    .int()
    .min(0, 'La comisión es requerida y debe ser mayor o igual a 0'),
  recargoCreditoCliente: precio,
  recargoCreditoChica: precio,
})

export const categoriaCreateSchema = categoriaBase.superRefine((data, ctx) => {
  if (data.tipo === 'trago' && (!data.precioCliente || !data.precioChica || data.comisionChica == null)) {
    ctx.addIssue({ code: 'custom', message: 'Para tragos se requieren precioCliente, precioChica y comisionChica' })
  }
  if (data.tipo === 'botella' && !data.precio) {
    ctx.addIssue({ code: 'custom', message: 'Para botellas se requiere precio' })
  }
})

export const categoriaUpdateSchema = categoriaBase.partial()

// ── Caja ────────────────────────────────────────────────────────

const monto = z.coerce.number().int('Monto invalido').min(0, 'Monto invalido').default(0)

export const cierreCajaSchema = z.object({
  totalEfectivo: monto,
  totalTransferencia: monto,
  totalDebito: monto,
  totalCredito: monto,
})

// ── Auditoria ───────────────────────────────────────────────────

export const auditoriaQuerySchema = z.object({
  usuarioId: idPositivo.optional(),
  tabla: z.string().trim().max(50).optional(),
  accion: z.string().trim().max(50).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})
