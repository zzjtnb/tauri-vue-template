interface ToOptionalPositiveIntPayload {
  value: unknown
}

interface ToRequiredPositiveIntPayload {
  value: unknown
  label: string
}

interface ToOptionalFiniteNumberPayload {
  value: unknown
}

function toFiniteNumber(value: unknown): number {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return Number.NaN
  }
  return numeric
}

export function toOptionalPositiveInt(payload: ToOptionalPositiveIntPayload): number | undefined {
  const numeric = toFiniteNumber(payload.value)
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return undefined
  }
  return numeric
}

export function toRequiredPositiveInt(payload: ToRequiredPositiveIntPayload): number {
  const numeric = toFiniteNumber(payload.value)
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new Error(`${payload.label}必须为正整数`)
  }
  return numeric
}

export function toOptionalFiniteNumber(payload: ToOptionalFiniteNumberPayload): number | undefined {
  const numeric = toFiniteNumber(payload.value)
  if (!Number.isFinite(numeric)) {
    return undefined
  }
  return numeric
}
