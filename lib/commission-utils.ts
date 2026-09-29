export interface CommissionSlotOptions {
  comisionTotal: number
  comisionChica1?: number | null
  comisionChica2?: number | null
  hasChica1?: boolean
  hasChica2?: boolean
  enforceEvenSplit?: boolean
}

export interface CommissionSlotResult {
  comisionChica1: number
  comisionChica2: number
}

export function normalizeCommissionSlots(options: CommissionSlotOptions): CommissionSlotResult {
  const {
    comisionTotal,
    comisionChica1,
    comisionChica2,
    hasChica1 = false,
    hasChica2 = false,
    enforceEvenSplit = false,
  } = options

  const total = Math.max(0, Math.round(comisionTotal ?? 0))
  const slot1Present = Boolean(hasChica1)
  const slot2Present = Boolean(hasChica2)
  const slotsCount = (slot1Present ? 1 : 0) + (slot2Present ? 1 : 0)

  const safeValue = (value: number | null | undefined) => Math.max(0, Math.round(value ?? 0))
  let value1 = slot1Present ? safeValue(comisionChica1) : 0
  let value2 = slot2Present ? safeValue(comisionChica2) : 0
  const assigned = value1 + value2

  const shouldForceEvenSplit = enforceEvenSplit && slotsCount > 0
  const missingDistribution = total > 0 && slotsCount > 0 && assigned === 0
  const needsRebalance = shouldForceEvenSplit || missingDistribution || (assigned !== total && slotsCount > 0)

  if (needsRebalance) {
    const base = Math.floor(total / slotsCount)
    let remainder = total - base * slotsCount

    const nextValue = (hasSlot: boolean) => {
      if (!hasSlot) return 0
      const extra = remainder > 0 ? 1 : 0
      if (remainder > 0) remainder -= 1
      return base + extra
    }

    value1 = nextValue(slot1Present)
    value2 = nextValue(slot2Present)
  }

  return {
    comisionChica1: value1,
    comisionChica2: value2,
  }
}
