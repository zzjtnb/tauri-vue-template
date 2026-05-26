/** 可选正整数归一化输入。 */
export interface OptionalPositiveIntInput {
  /** 待归一化的外部输入。 */
  value: unknown
}

/** 必填正整数归一化输入。 */
export interface RequiredPositiveIntInput {
  /** 错误提示中展示的字段名称。 */
  label: string
  /** 待归一化的外部输入。 */
  value: unknown
}

/** 可选有限数字归一化输入。 */
export interface OptionalFiniteNumberInput {
  /** 待归一化的外部输入。 */
  value: unknown
}
