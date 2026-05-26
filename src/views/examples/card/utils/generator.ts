/**
 * 虚拟信用卡生成器实现
 * @module cardGenerator
 * @see {@link @/views/examples/card/types} 类型定义包含完整的模块文档和使用说明
 */

import type {
  CardBrand,
  CardValidationResult,
  FormatPanFunction,
  GenerateCardFunction,
  GenerateCardNumberFunction,
  GenerateCardsFunction,
  GenerateCVVFunction,
  GenerateExpiryFunction,
  GenerateNameFunction,
  IdentifyBrandFunction,
  LocaleConfig,
  LuhnCheckFunction,
  ValidateCardFunction,
} from '../types'

// 注：以下类型仅用于内部函数的类型标注
// GenerateCardFunction, GenerateCardNumberFunction, GenerateCVVFunction, GenerateExpiryFunction, GenerateNameFunction, IdentifyBrandFunction, LuhnCheckFunction
import { fakerDE, fakerEN, fakerES, fakerFR, fakerIT, fakerJA, fakerKO, fakerPT_BR, fakerZH_CN, fakerZH_TW } from '@faker-js/faker'

// ========= 品牌统一配置 =========
/**
 * 信用卡品牌统一配置表
 * @see CardBrand 类型定义包含完整的品牌配置说明
 */
export const BRAND_CONFIG: Record<string, CardBrand> = Object.freeze({
  visa: {
    key: 'visa',
    name: 'Visa',
    nameZh: '维萨卡',
    // IIN: 4 - Visa 的 MII（Major Industry Identifier）
    ranges: [{ iin: '4' }],
    validLengths: [16],
    cvvLength: 3,
    region: '全球',
    format: '4-4-4-4',
    popular: true,
    color: '#1A1F71',
    logo: 'i-logos-visa',
    website: 'https://www.visa.com',
  },
  mastercard: {
    key: 'mastercard',
    name: 'Mastercard',
    nameZh: '万事达卡',
    // IIN: 51-55（传统）、2221-2720（新范围，2016年起）
    ranges: [
      { iin: '51', min: 51, max: 55 },
      { iin: '2221', min: 2221, max: 2720 },
    ],
    validLengths: [16],
    cvvLength: 3,
    region: '全球',
    format: '4-4-4-4',
    popular: true,
    color: '#EB001B',
    logo: 'i-logos-mastercard',
    website: 'https://www.mastercard.com',
  },
  amex: {
    key: 'amex',
    name: 'American Express',
    nameZh: '美国运通',
    // IIN: 34, 37 - American Express 的 IIN
    ranges: [
      { iin: '34' },
      { iin: '37' },
    ],
    validLengths: [15],
    cvvLength: 4,
    region: '美国/全球',
    format: '4-6-5',
    popular: true,
    color: '#006FCF',
    logo: 'i-logos-amex',
    website: 'https://www.americanexpress.com',
  },
  unionpay: {
    key: 'unionpay',
    name: 'UnionPay',
    nameZh: '中国银联',
    // IIN: 62 系列（主要）- 中国银联的 IIN（中文维基百科标准）
    ranges: [{ iin: '62' }],
    validLengths: [16, 17, 18, 19],
    cvvLength: 3,
    region: '中国/亚太',
    format: '4-4-4-4',
    popular: true,
    color: '#E21836',
    logo: 'i-logos-unionpay',
    website: 'https://www.unionpayintl.com',
  },
  discover: {
    key: 'discover',
    name: 'Discover',
    nameZh: '发现卡',
    // IIN: 6011, 65, 622126-622925, 644-649
    ranges: [
      { iin: '6011' },
      { iin: '65' },
      { iin: '622126', min: 622126, max: 622925 },
      { iin: '644', min: 644, max: 649 },
    ],
    validLengths: [16],
    cvvLength: 3,
    region: '美国',
    format: '4-4-4-4',
    popular: false,
    color: '#FF6000',
    logo: 'i-logos-discover',
    website: 'https://www.discover.com',
  },
  jcb: {
    key: 'jcb',
    name: 'JCB',
    nameZh: '日本信用卡',
    // IIN: 3528-3589 - JCB 的 IIN 范围
    ranges: [{ iin: '3528', min: 3528, max: 3589 }],
    validLengths: [16],
    cvvLength: 3,
    region: '日本/亚太',
    format: '4-4-4-4',
    popular: false,
    color: '#0E4C96',
    logo: 'i-logos-jcb',
    website: 'https://www.global.jcb',
  },
  dinersclub: {
    key: 'dinersclub',
    name: 'Diners Club',
    nameZh: '大来卡',
    // IIN: 300-305, 36, 38, 39, 55（美国/加拿大 Mastercard 联盟）
    ranges: [
      { iin: '300', min: 300, max: 305 },
      { iin: '36' },
      { iin: '38' },
      { iin: '39' },
      { iin: '55' },
    ],
    validLengths: [14, 15, 16, 17, 18, 19],
    cvvLength: 3,
    region: '全球',
    format: '4-6-4',
    popular: false,
    color: '#0079BE',
    logo: 'i-logos-dinersclub',
    website: 'https://www.dinersclub.com',
  },
  maestro: {
    key: 'maestro',
    name: 'Maestro',
    nameZh: 'Maestro 借记卡',
    // IIN: 5018, 5020, 5038, 6304, 6759, 6761-6763 - Maestro 借记卡 IIN（中文维基百科标准）
    ranges: [
      { iin: '5018' },
      { iin: '5020' },
      { iin: '5038' },
      { iin: '6304' },
      { iin: '6759' },
      { iin: '6761' },
      { iin: '6762' },
      { iin: '6763' },
    ],
    validLengths: [12, 13, 14, 15, 16, 17, 18, 19],
    cvvLength: 3,
    region: '欧洲',
    format: '4-4-4-4',
    popular: false,
    color: '#0099DF',
    logo: 'i-logos-maestro',
    website: 'https://www.mastercard.com/maestro',
  },
  elo: {
    key: 'elo',
    name: 'Elo',
    nameZh: 'Elo 卡',
    // IIN: 4011, 438935, 451416, 4576, 636297, 636368 - Elo 卡 IIN（巴西）
    ranges: [
      { iin: '4011' },
      { iin: '438935' },
      { iin: '451416' },
      { iin: '4576' },
      { iin: '636297' },
      { iin: '636368' },
    ],
    validLengths: [16],
    cvvLength: 3,
    region: '巴西',
    format: '4-4-4-4',
    popular: false,
    color: '#FFCB05',
    logo: 'i-logos-elo',
    website: 'https://www.elo.com.br',
  },
})

// ========= 工具函数 =========
// 提取纯数字
const extractDigits = (input: string | number) => String(input).replace(/\D/g, '')

// 生成随机整数 [min, max]
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// 生成随机数字字符串
const randomDigits = (count: number) => Array.from({ length: count }, () => randomInt(0, 9)).join('')

// 从数组中随机选择一个元素
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

/**
 * 初始化缓存：品牌名称映射、排序品牌
 */
const initCache = (() => {
  let cached: {
    nameMap: Map<string, CardBrand>
    sortedBrands: Array<{ brand: CardBrand, sortedIin: string[] }>
  } | null = null

  return () => {
    if (!cached) {
      const brands = Object.values(BRAND_CONFIG)

      // 构建品牌名称映射
      const nameMap = new Map<string, CardBrand>()
      brands.forEach(brand => nameMap.set(brand.name, brand))

      // 排序品牌列表（按 IIN 最大长度降序，再按主流品牌优先）
      const sortedBrands = brands
        .sort((a, b) => {
          const maxLenA = Math.max(...a.ranges.map(r => r.iin.length))
          const maxLenB = Math.max(...b.ranges.map(r => r.iin.length))
          if (maxLenA !== maxLenB)
            return maxLenB - maxLenA
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0)
        })
        .map(brand => ({
          brand,
          sortedIin: brand.ranges.map(r => r.iin).sort((a, b) => b.length - a.length),
        }))

      cached = { nameMap, sortedBrands }
    }
    return cached
  }
})()

/**
 * 根据品牌名称获取配置（内部辅助函数）
 */
function getBrandConfigByName(brandName: string): CardBrand | undefined {
  return initCache().nameMap.get(brandName)
}

/**
 * 获取排序后的品牌列表
 */
function getSortedBrands(): Array<{ brand: CardBrand, sortedIin: string[] }> {
  return initCache().sortedBrands
}

// ========= 品牌识别算法 =========
/**
 * 智能识别信用卡品牌
 * @see IdentifyBrandFunction 类型定义包含完整的识别规则和示例
 */
function isInRange(range: { iin: string, min?: number, max?: number }, number: string): boolean {
  // 无范围规则或单个 IIN，直接通过
  if (range.min === undefined || range.max === undefined)
    return true

  const numValue = Number.parseInt(number.substring(0, range.iin.length), 10)
  return numValue >= range.min && numValue <= range.max
}

export const identifyBrand: IdentifyBrandFunction = (cardNumber) => {
  const number = extractDigits(cardNumber)
  if (!number)
    return 'Unknown'

  // 使用预计算的排序品牌列表和 IIN
  const sortedBrandsData = getSortedBrands()

  for (const { brand, sortedIin } of sortedBrandsData) {
    for (const iin of sortedIin) {
      if (number.startsWith(iin)) {
        // 找到对应的范围规则并验证
        const range = brand.ranges.find(r => r.iin === iin)
        if (range && isInRange(range, number))
          return brand.name
      }
    }
  }

  return 'Unknown'
}

// ========= Luhn 算法实现 =========
/**
 * 计算 Luhn 校验和（内部工具函数）
 * @param digits - 数字字符串
 * @param fromRight - 从右边第几位开始（0=完整卡号校验，1=计算校验位）
 */
function calculateLuhnSum(digits: string, fromRight = 0): number {
  return [...digits].reverse().reduce((acc, char, i) => {
    const digit = Number(char)
    const shouldDouble = (i + fromRight) % 2 === 1
    return acc + (shouldDouble ? (digit * 2 > 9 ? digit * 2 - 9 : digit * 2) : digit)
  }, 0)
}

/**
 * Luhn 算法校验
 * @see LuhnCheckFunction 类型定义包含完整的算法步骤和示例
 */
const validateLuhn: LuhnCheckFunction = (cardNumber) => {
  const digits = extractDigits(cardNumber)
  return digits.length >= 13 && calculateLuhnSum(digits) % 10 === 0
}

/**
 * 详细验证信用卡号
 * @see ValidateCardFunction 类型定义包含完整说明
 */
export const validateCardNumberDetailed: ValidateCardFunction = (cardNumber) => {
  const result: CardValidationResult = {
    valid: false,
    brand: 'Unknown',
    length: 0,
    luhnValid: false,
    errors: [],
    warnings: [],
  }

  // 清理并提取纯数字
  const digits = extractDigits(cardNumber)
  result.length = digits.length

  // 1. 检查是否为空
  if (!digits) {
    result.errors.push('卡号不能为空')
    return result
  }

  // 2. 检查长度
  if (digits.length < 13) {
    result.errors.push(`卡号长度不足，最少需要 13 位，当前 ${digits.length} 位`)
  }
  else if (digits.length > 19) {
    result.errors.push(`卡号长度过长，最多 19 位，当前 ${digits.length} 位`)
  }

  // 3. 识别品牌
  result.brand = identifyBrand(digits)
  if (result.brand === 'Unknown') {
    result.warnings.push('无法识别卡片品牌，IIN 不匹配任何已知品牌')
  }

  // 4. 检查长度是否符合品牌规范
  if (result.brand !== 'Unknown') {
    const config = getBrandConfigByName(result.brand)

    if (config && !config.validLengths.includes(result.length)) {
      result.warnings.push(
        `${result.brand} 有效长度为 ${config.validLengths.join(', ')} 位，当前为 ${result.length} 位`,
      )
    }
  }

  // 5. Luhn 校验
  result.luhnValid = validateLuhn(digits)
  if (!result.luhnValid) {
    result.errors.push('未通过 Luhn 算法校验，卡号无效')
  }

  // 6. 检查是否全为相同数字
  if (/^(\d)\1+$/.test(digits)) {
    result.errors.push('卡号不能全为相同数字')
  }

  // 7. 检查是否为连续数字
  const isSequential = digits.split('').every((digit, i, arr) => {
    if (i === 0)
      return true
    return Number(digit) === Number(arr[i - 1]) + 1
  })
  if (isSequential) {
    result.warnings.push('卡号为连续数字，可能不是真实卡号')
  }

  // 综合判断
  result.valid = result.errors.length === 0 && result.luhnValid

  return result
}

// ========= 格式化工具 =========
/**
 * 格式化信用卡号为易读形式
 * @see FormatPanFunction 类型定义包含完整的格式化规则和示例
 */
export const formatPan: FormatPanFunction = (pan) => {
  const digits = extractDigits(pan)
  if (!digits)
    return ''

  // 识别品牌并使用对应格式（优化：直接通过 IIN 匹配获取配置，避免两次查找）
  const config = Object.values(BRAND_CONFIG).find(brand =>
    brand.ranges.some(r => digits.startsWith(r.iin)),
  )

  if (config?.format) {
    const parts = config.format.split('-').map(Number)
    let formatted = ''
    let index = 0

    for (const len of parts) {
      if (index >= digits.length)
        break
      if (formatted)
        formatted += ' '
      formatted += digits.substring(index, index + len)
      index += len
    }

    // 添加剩余数字
    if (index < digits.length) {
      if (formatted)
        formatted += ' '
      formatted += digits.substring(index)
    }

    return formatted
  }

  // 降级：使用默认 4-4-4-4 格式
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

// ========= 卡号生成算法 =========
/**
 * 生成符合 Luhn 算法的信用卡号
 * @see GenerateCardNumberFunction 类型定义包含完整的生成步骤和示例
 */
const generateCardNumber: GenerateCardNumberFunction = (brand, customIin = '') => {
  // 1. 清理自定义 IIN，移除所有非数字字符
  let iin = extractDigits(customIin)
  let length = 16

  // 2. 确定品牌配置和卡号长度
  if (!iin) {
    // 如果是 'any'，从主流品牌中随机选择一个
    if (brand === 'any') {
      brand = randomItem(['visa', 'mastercard', 'amex', 'unionpay'])
    }

    // 获取品牌配置，如果品牌不存在则降级到 Visa
    const config = BRAND_CONFIG[brand] ?? BRAND_CONFIG.visa
    // 从品牌的范围列表中随机选择一个 IIN
    iin = randomItem(config.ranges).iin
    // 从品牌的有效长度中随机选择一个
    length = randomItem(config.validLengths)
  }
  else {
    // 有自定义 IIN 时，根据 IIN 识别品牌并推断长度
    const detectedBrand = identifyBrand(iin)
    if (detectedBrand !== 'Unknown') {
      const config = getBrandConfigByName(detectedBrand)
      if (config) {
        // 从品牌的有效长度中随机选择一个
        length = randomItem(config.validLengths)
      }
    }
  }

  // 3. 计算需要填充的随机数字位数（总长度 - IIN 长度 - 1位校验位）
  const digitsNeeded = length - iin.length - 1
  if (digitsNeeded < 0) {
    throw new Error(`IIN "${iin}" 过长，无法生成 ${length} 位卡号`)
  }

  // 4. 生成随机数字填充中间部分
  const partialNumber = iin + randomDigits(digitsNeeded)

  // 5. 使用 Luhn 算法计算最后一位校验位
  const checkDigit = (10 - (calculateLuhnSum(partialNumber, 1) % 10)) % 10

  // 6. 拼接完整卡号并返回
  return partialNumber + checkDigit
}

// ========= 到期日期和 CVV 生成 =========
/**
 * 生成信用卡到期日期
 * @see GenerateExpiryFunction 类型定义包含完整的生成规则和示例
 */
const generateExpiry: GenerateExpiryFunction = () => {
  const year = new Date().getFullYear() + randomInt(1, 5)
  return `${String(randomInt(1, 12)).padStart(2, '0')}/${String(year).slice(-2)}`
}

/**
 * 生成卡片验证码
 * @see GenerateCVVFunction 类型定义包含完整的生成规则和示例
 */
const generateCVV: GenerateCVVFunction = (isAmex = false) =>
  randomDigits(isAmex ? 4 : 3)

// ========= 姓名生成（Faker.js）=========

/**
 * 支持的地区/语言配置
 * @see LocaleConfig 类型定义包含完整的地区配置说明
 */
export const SUPPORTED_LOCALES: Record<string, LocaleConfig> = Object.freeze({
  en: { label: '英语', faker: fakerEN },
  zh_CN: { label: '简体中文', faker: fakerZH_CN },
  zh_TW: { label: '繁体中文', faker: fakerZH_TW },
  ja: { label: '日语', faker: fakerJA },
  ko: { label: '韩语', faker: fakerKO },
  fr: { label: '法语', faker: fakerFR },
  de: { label: '德语', faker: fakerDE },
  es: { label: '西班牙语', faker: fakerES },
  it: { label: '意大利语', faker: fakerIT },
  pt_BR: { label: '葡萄牙语（巴西）', faker: fakerPT_BR },
})

/**
 * 生成随机姓名
 * @see GenerateNameFunction 类型定义包含完整的支持地区和示例
 */
const generateName: GenerateNameFunction = (locale = 'en') =>
  (SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES] || SUPPORTED_LOCALES.en).faker.person.fullName()

/**
 * 生成完整的虚拟信用卡信息
 * @see GenerateCardFunction 类型定义包含完整的生成步骤和示例
 */
const generateCard: GenerateCardFunction = (brand, customPrefix = '', locale = 'en') => {
  // 1. 生成符合 Luhn 算法的卡号
  const cardNumber = generateCardNumber(brand, customPrefix)

  // 2. 识别卡号对应的品牌
  const detectedBrand = BRAND_CONFIG[brand]?.name || identifyBrand(cardNumber)

  // 3. 判断 CVV 长度（American Express 为 4 位，其他为 3 位）
  const isAmex = detectedBrand === 'American Express'

  // 4. 组装完整卡片信息
  return {
    number: cardNumber, // 卡号（已通过 Luhn 算法验证）
    name: generateName(locale), // 持卡人姓名（根据地区生成）
    expiry: generateExpiry(), // 有效期（未来 1-5 年）
    cvv: generateCVV(isAmex), // CVV/CVC 码
    brand: detectedBrand, // 品牌名称
  }
}

// ========= 批量生成 =========
/**
 * 批量生成虚拟信用卡
 * @see GenerateCardsFunction 类型定义包含完整的生成步骤和示例
 */
export const generateCards: GenerateCardsFunction = (brand, count, customPrefix = '', locale = 'en') => {
  // 1. 参数验证：确保生成数量在合理范围内
  if (count < 1 || count > 100) {
    throw new Error('生成数量必须在 1-100 之间')
  }

  try {
    // 2. 批量生成：循环调用 generateCard() 生成指定数量的卡片
    // 每张卡片都是独立生成，卡号、姓名、有效期、CVV 均不同
    return Array.from({ length: count }, () => generateCard(brand, customPrefix, locale))
  }
  catch (error) {
    // 3. 错误处理：捕获并包装错误信息
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`批量生成失败: ${message}`)
  }
}
