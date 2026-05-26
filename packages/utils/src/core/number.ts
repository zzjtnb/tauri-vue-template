import type { OptionalFiniteNumberInput, OptionalPositiveIntInput, RequiredPositiveIntInput } from './types.ts'

function toFiniteNumber(value: unknown): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue))
    return Number.NaN

  return numericValue
}

/**
 * 把外部输入归一化为可选正整数。
 *
 * @param input - 待归一化输入对象。
 * @returns 输入是正整数时返回数字，否则返回 undefined。
 * @public
 */
export function toOptionalPositiveInt(input: OptionalPositiveIntInput): number | undefined {
  const numericValue = toFiniteNumber(input.value)
  if (!Number.isInteger(numericValue) || numericValue <= 0)
    return undefined

  return numericValue
}

/**
 * 把外部输入归一化为必填正整数。
 *
 * @param input - 待归一化输入对象，label 用于错误提示。
 * @returns 已确认的正整数。
 * @throws 当输入不是正整数时抛出带字段名的错误。
 * @public
 */
export function toRequiredPositiveInt(input: RequiredPositiveIntInput): number {
  const numericValue = toFiniteNumber(input.value)
  if (!Number.isInteger(numericValue) || numericValue <= 0)
    throw new Error(`${input.label}必须为正整数`)

  return numericValue
}

/**
 * 把外部输入归一化为可选有限数字。
 *
 * @param input - 待归一化输入对象。
 * @returns 输入是有限数字时返回数字，否则返回 undefined。
 * @public
 */
export function toOptionalFiniteNumber(input: OptionalFiniteNumberInput): number | undefined {
  const numericValue = toFiniteNumber(input.value)
  if (!Number.isFinite(numericValue))
    return undefined

  return numericValue
}
