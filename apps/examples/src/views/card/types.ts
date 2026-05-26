/**
 * 虚拟信用卡类型定义模块
 * @description 定义虚拟信用卡生成器的所有类型、接口和函数签名
 *
 * @module types/card
 * @version 2.0.0
 * @author Account Switch Team
 * @license MIT
 * @requires ES2025+
 * @requires @faker-js/faker
 *
 * @remarks
 * ## 模块功能
 *
 * 本模块基于 **ISO/IEC 7812** 标准实现，提供完整的虚拟信用卡生成和验证功能：
 *
 * ### 支持的功能
 * - ✅ **9 个主流信用卡品牌**：Visa, Mastercard, AmEx, Discover, UnionPay, JCB, Diners Club, Maestro, Elo
 * - ✅ **Luhn 算法**：完整的校验和生成实现
 * - ✅ **多语言支持**：10 种语言地区的姓名生成（en, zh_CN, zh_TW, ja, ko, fr, de, es, it, pt_BR）
 * - ✅ **完整卡片信息**：卡号、姓名、有效期、CVV
 * - ✅ **批量生成**：支持一次生成最多 100 张卡片
 * - ✅ **详细验证**：品牌识别、长度检查、格式验证
 *
 * ### 类型定义分类
 *
 * **数据接口类型（4个）：**
 * - {@link CardBrand} - 信用卡品牌配置（9个品牌）
 * - {@link VirtualCard} - 生成的虚拟信用卡信息
 * - {@link CardValidationResult} - 卡号验证结果
 * - {@link LocaleConfig} - 地区/语言配置（10种语言）
 *
 * **函数类型定义（10个）：**
 * - {@link LuhnCheckFunction} - Luhn 算法校验
 * - {@link ValidateCardFunction} - 详细验证
 * - {@link GetBrandNameFunction} - 品牌识别
 * - {@link FormatPanFunction} - 卡号格式化
 * - {@link GenerateCardNumberFunction} - 卡号生成
 * - {@link GenerateExpiryFunction} - 有效期生成
 * - {@link GenerateCVVFunction} - CVV 生成
 * - {@link GenerateNameFunction} - 姓名生成
 * - {@link GenerateCardFunction} - 单卡生成
 * - {@link GenerateCardsFunction} - 批量生成
 *
 * @example
 * ### 类型定义使用示例
 * ```typescript
 * import type { CardBrand, VirtualCard, GenerateCardFunction } from '@/views/card/types'
 *
 * // 定义品牌配置
 * const visaConfig: CardBrand = {
 *   key: 'visa',
 *   name: 'Visa',
 *   nameZh: '维萨卡',
 *   ranges: [{ iin: '4' }],
 *   validLengths: [16],
 *   cvvLength: 3,
 *   region: '全球',
 *   format: '4-4-4-4',
 *   popular: true
 * }
 *
 * // 使用函数类型
 * const myGenerator: GenerateCardFunction = (brand, prefix, locale) => {
 *   // 实现生成逻辑
 *   return {
 *     number: '4532015112830366',
 *     name: 'John Smith',
 *     expiry: '08/28',
 *     cvv: '123',
 *     brand: 'Visa'
 *   }
 * }
 * ```
 *
 * @example
 * ### 实际使用示例
 * ```typescript
 * import { generateCard, validateCardNumberDetailed } from '@/views/card/utils/generator'
 * import { BRAND_CONFIG } from '@/views/card/utils/generator'
 *
 * // 生成单张卡片
 * const card = generateCard('visa', '', 'zh_CN')
 * console.log(card)
 * // { number: '4532015112830366', name: '张伟', expiry: '08/28', cvv: '123', brand: 'Visa' }
 *
 * // 验证卡号
 * const result = validateCardNumberDetailed('4532015112830366')
 * console.log(result.valid) // true
 * console.log(result.brand) // 'Visa'
 *
 * // 访问品牌配置
 * const visaBrand = BRAND_CONFIG.visa
 * console.log(visaBrand.ranges) // [{ iin: '4' }]
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/ISO/IEC_7812 | ISO/IEC 7812 标准}
 * @see {@link https://en.wikipedia.org/wiki/Luhn_algorithm | Luhn 算法}
 * @see {@link https://fakerjs.dev/ | Faker.js 文档}
 */

// ========= 数据接口类型 =========

/**
 * 信用卡品牌配置
 * @description 定义单个信用卡品牌的完整配置信息，基于 ISO/IEC 7812 标准
 *
 * @property {string} key - 品牌唯一标识（如 'visa', 'mastercard'）
 * @property {string} name - 品牌英文名称
 * @property {string} nameZh - 品牌中文名称
 * @property {Array<{ iin: string; min?: number; max?: number }>} ranges - IIN 范围数组
 * @property {number[]} validLengths - 支持的所有有效卡号长度（生成时随机选择）
 * @property {number} cvvLength - CVV/CVC 长度（3位或4位）
 * @property {string} region - 主要使用地区
 * @property {string} format - 卡号显示格式（如 '4-4-4-4'）
 * @property {boolean} popular - 是否为主流品牌（用于随机生成）
 * @property {string} [color] - 品牌主题色（可选，用于UI显示）
 * @property {string} [logo] - 品牌Logo标识（可选）
 * @property {string} [website] - 品牌官方网站（可选）
 *
 * @remarks
 * 支持的品牌配置（BRAND_CONFIG）：
 * - **visa**: Visa 卡（全球最大卡组织，IIN '4'）
 * - **mastercard**: Mastercard 卡（全球第二大，IIN '51-55' 或 '2221-2720'）
 * - **amex**: American Express 卡（15位，4位CVV，IIN '34' 或 '37'）
 * - **discover**: Discover 卡（美国，IIN '6011', '644-649', '65' 等）
 * - **unionpay**: 中国银联卡（中国/亚太，IIN '62' 系列）
 * - **jcb**: JCB 卡（日本，IIN '3528-3589'）
 * - **dinersclub**: Diners Club 卡（14-19位，IIN '300-305', '36', '38', '39'）
 * - **maestro**: Maestro 借记卡（欧洲，IIN '50', '56-58', '6304' 等）
 * - **elo**: Elo 卡（巴西，IIN '4011', '4312', '4389' 等）
 *
 * @example
 * ```typescript
 * const visaBrand: CardBrand = {
 *   key: 'visa',
 *   name: 'Visa',
 *   nameZh: '维萨卡',
 *   ranges: [{ iin: '4' }],
 *   validLengths: [16],
 *   cvvLength: 3,
 *   region: '全球',
 *   format: '4-4-4-4',
 *   popular: true,
 *   color: '#1A1F71',
 *   website: 'https://www.visa.com'
 * }
 * ```
 */
export interface CardBrand {
  key: string
  name: string
  nameZh: string
  // IIN（Issuer Identification Number）范围定义
  // - 范围：{ iin: '51', min: 51, max: 55 } 表示 51-55
  // - 单个：{ iin: '4' } 表示仅 4
  // IIN 可以是 6 位或 8 位，用于唯一标识发卡机构
  ranges: Array<{ iin: string, min?: number, max?: number }>
  validLengths: number[] // 支持的所有有效长度（统一使用数组）
  cvvLength: number
  region: string
  format: string
  popular: boolean
  // 扩展字段（可选）
  color?: string // 品牌主题色（用于UI显示）
  logo?: string // 品牌Logo标识
  website?: string // 品牌官方网站
}

/**
 * 生成的虚拟信用卡信息
 * @property {string} number - 卡号（符合品牌有效长度）
 * @property {string} name - 持卡人姓名
 * @property {string} expiry - 到期日期（MM/YY 格式）
 * @property {string} cvv - CVV/CVC 验证码（3-4位）
 * @property {string} brand - 品牌名称
 */
export interface VirtualCard {
  /**
   * 卡号（符合品牌有效长度）
   */
  number: string
  /**
   * 持卡人姓名
   */
  name: string
  /**
   * 到期日期（MM/YY 格式）
   */
  expiry: string
  /**
   * CVV/CVC 验证码（3-4位）
   */
  cvv: string
  /**
   * 品牌名称
   */
  brand: string
}

/**
 * 卡号验证结果
 * @property {boolean} valid - 卡号是否有效（无错误且通过 Luhn 校验）
 * @property {string} brand - 识别的品牌名称
 * @property {number} length - 卡号长度（位数）
 * @property {boolean} luhnValid - 是否通过 Luhn 算法校验
 * @property {string[]} errors - 错误信息数组（阻止性问题）
 * @property {string[]} warnings - 警告信息数组（非阻止性问题）
 */
export interface CardValidationResult {
  valid: boolean
  brand: string
  length: number
  luhnValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 地区/语言配置
 * @description 定义姓名生成支持的语言地区配置
 *
 * @property {string} label - 语言显示名称（中文）
 * @property {any} faker - Faker.js 实例（对应语言）
 *
 * @remarks
 * 支持的地区配置（SUPPORTED_LOCALES）：
 * - **en**: 英语
 * - **zh_CN**: 简体中文
 * - **zh_TW**: 繁体中文
 * - **ja**: 日语
 * - **ko**: 韩语
 * - **fr**: 法语
 * - **de**: 德语
 * - **es**: 西班牙语
 * - **it**: 意大利语
 * - **pt_BR**: 葡萄牙语（巴西）
 *
 * @example
 * ```typescript
 * const zhConfig: LocaleConfig = {
 *   label: '简体中文',
 *   faker: fakerZH_CN
 * }
 * ```
 */
export interface LocaleConfig {
  label: string
  faker: any
}

// ========= 函数类型定义 =========

/**
 * Luhn 校验函数类型
 * @description 验证信用卡号是否符合 Luhn 算法（模 10 算法）
 *
 * 算法步骤：
 * 1. 从右往左，对偶数位数字乘以 2
 * 2. 如果乘积大于 9，则减去 9
 * 3. 将所有数字求和
 * 4. 如果和能被 10 整除，则通过校验
 *
 * @param cardNumber - 待验证的卡号
 * @returns 是否通过 Luhn 校验
 *
 * @example
 * validateLuhn('4532015112830366') // true
 * validateLuhn('1234567890123456') // false
 */
export type LuhnCheckFunction = (cardNumber: string) => boolean

/**
 * 卡号验证函数类型
 * @description 详细验证信用卡号，包括 Luhn 校验、品牌识别、长度检查、格式验证等
 *
 * 验证内容：
 * 1. 检查卡号是否为空
 * 2. 检查长度是否在 13-19 位之间
 * 3. 识别品牌（基于 IIN）
 * 4. 检查长度是否符合品牌规范
 * 5. Luhn 算法校验
 * 6. 检查是否全为相同数字
 * 7. 检查是否为连续数字
 *
 * @param cardNumber - 待验证的卡号
 * @returns 详细的验证结果对象，包含 valid, brand, length, luhnValid, errors, warnings
 *
 * @example
 * validateCardNumberDetailed('4532015112830366')
 * // {
 * //   valid: true,
 * //   brand: 'Visa',
 * //   length: 16,
 * //   luhnValid: true,
 * //   errors: [],
 * //   warnings: []
 * // }
 */
export type ValidateCardFunction = (cardNumber: string) => CardValidationResult

/**
 * 品牌识别函数类型
 * @description 根据卡号 IIN 识别发卡机构，基于 ISO/IEC 7812 标准
 *
 * 识别规则（按文档完整实现）：
 * - Visa: 以 4 开头
 * - Mastercard: 51-55（旧）或 2221-2720（新，2017年起）
 * - American Express: 34 或 37（15位，4位CVV）
 * - Discover: 6011, 622126-622925, 624-626, 644-649, 65, 6282
 * - UnionPay: 62 开头（621-629 系列）
 * - JCB: 3528-3589
 * - Diners Club: 300-305, 36, 38, 39
 * - Maestro: 50, 56-58, 6304, 6761-6763
 * - Elo: 4011, 4312, 4389, 4514, 4576, 6277, 6362（巴西）
 *
 * @param cardNumber - 信用卡号
 * @returns 品牌名称（'Visa', 'Mastercard', 'American Express' 等）
 *
 * @example
 * identifyBrand('4532015112830366') // 'Visa'
 * identifyBrand('5425233430109903') // 'Mastercard'
 * identifyBrand('378282246310005') // 'American Express'
 * identifyBrand('6221260000000000') // 'Discover'（与银联共享区间）
 */
export type IdentifyBrandFunction = (cardNumber: string) => string

/**
 * 卡号格式化函数类型
 * @description 将连续数字分组，便于阅读，自动识别品牌格式
 *
 * 格式化规则：
 * - 优化：通过 IIN 直接匹配品牌配置，避免两次查找
 * - Visa/Mastercard/UnionPay: 4-4-4-4
 * - American Express: 4-6-5
 * - Diners Club: 4-6-4
 * - 未识别品牌：默认 4-4-4-4
 *
 * @param pan - Primary Account Number（主账号）
 * @returns 格式化后的卡号（如 '4532 0151 1283 0366'）
 *
 * @example
 * formatPan('4532015112830366') // '4532 0151 1283 0366'
 * formatPan('378282246310005') // '3782 822463 10005'
 * formatPan('30012345678901') // '3001 234567 8901'
 */
export type FormatPanFunction = (pan: string) => string

/**
 * 卡号生成函数类型
 * @description 根据品牌和可选 IIN 生成符合 Luhn 算法的有效卡号
 *
 * 生成步骤：
 * 1. 清理自定义 IIN，移除所有非数字字符
 * 2. 确定品牌配置（如果是 'any' 则随机选择主流品牌）
 * 3. 随机选择品牌的 IIN 和有效长度（从 validLengths 中随机选择）
 * 4. 计算需要填充的随机数字位数（总长度 - IIN 长度 - 1位校验位）
 * 5. 生成随机数字填充中间部分
 * 6. 使用 Luhn 算法计算最后一位校验位
 * 7. 拼接完整卡号并返回
 *
 * @param brand - 品牌代码（'visa', 'mastercard', 'amex', 'any' 等）
 * @param customIin - 自定义 IIN（可选）
 * @returns 生成的完整卡号
 *
 * @example
 * generateCardNumber('visa') // '4532015112830366'
 * generateCardNumber('mastercard', '5425') // '5425233430109903'
 */
export type GenerateCardNumberFunction = (brand: string, customIin?: string) => string

/**
 * 有效期生成函数类型
 * @description 生成未来 1-5 年内的随机到期日期
 *
 * 生成规则：
 * - 年份：当前年份 + 1 到 5 年
 * - 月份：1-12 月随机
 * - 格式：MM/YY（如 08/28）
 *
 * @returns MM/YY 格式的到期日期
 *
 * @example
 * generateExpiry() // '08/28'
 */
export type GenerateExpiryFunction = () => string

/**
 * CVV 生成函数类型
 * @description 生成卡片验证码（Card Verification Value/Code）
 *
 * 生成规则：
 * - American Express: 4位 CID（Card Identification Number）
 * - 其他品牌: 3位 CVV/CVC
 * - 随机生成数字，不足位数前补0
 *
 * @param isAmex - 是否为 American Express（4位CID），默认为 false（3位CVV）
 * @returns CVV/CVC 码
 *
 * @example
 * generateCVV() // '123'
 * generateCVV(true) // '1234'（Amex）
 */
export type GenerateCVVFunction = (isAmex?: boolean) => string

/**
 * 姓名生成函数类型
 * @description 使用 Faker.js 库生成指定地区的真实感姓名
 *
 * 支持的地区：
 * - en: 英语
 * - zh_CN: 简体中文
 * - zh_TW: 繁体中文
 * - ja: 日语
 * - ko: 韩语
 * - fr: 法语
 * - de: 德语
 * - es: 西班牙语
 * - it: 意大利语
 * - pt_BR: 葡萄牙语（巴西）
 *
 * @param locale - 地区代码，默认 'en'
 * @returns 完整姓名
 *
 * @example
 * generateName() // 'John Smith' (默认英语)
 * generateName('zh_CN') // '张伟'
 * generateName('ja') // '田中太郎'
 */
export type GenerateNameFunction = (locale?: string) => string

/**
 * 单卡生成函数类型
 * @description 一站式生成包含卡号、姓名、到期日期、CVV 的完整卡片
 *
 * 生成步骤：
 * 1. 调用 generateCardNumber() 生成符合 Luhn 算法的卡号
 * 2. 识别品牌（优化：从已知品牌推断，仅在 'any' 时才调用 getBrandName()）
 * 3. 根据品牌判断 CVV 长度（AmEx 为 4 位，其他为 3 位）
 * 4. 调用 generateName() 生成指定地区的持卡人姓名
 * 5. 调用 generateExpiry() 生成未来 1-5 年的有效期
 * 6. 调用 generateCVV() 生成对应长度的 CVV
 * 7. 组装完整卡片对象（使用 VirtualCard 类型）
 * 8. 二次校验卡号是否通过 Luhn 算法（防御性编程）
 *
 * @param brand - 品牌代码（'visa', 'mastercard', 'amex', 'unionpay', 'any' 等）
 * @param customPrefix - 自定义 BIN/IIN 前缀（可选）
 * @param locale - 姓名地区代码（可选，默认 'en'）
 * @returns 完整卡片信息对象
 *
 * @example
 * const card = generateCard('visa')
 * // {
 * //   number: '4532015112830366',
 * //   name: 'John Smith',
 * //   expiry: '08/28',
 * //   cvv: '123',
 * //   brand: 'Visa'
 * // }
 */
export type GenerateCardFunction = (brand: string, customPrefix?: string, locale?: string) => VirtualCard

/**
 * 批量生成函数类型
 * @description 一次性生成多张卡片，适用于测试场景
 *
 * 生成步骤：
 * 1. 参数验证：确保生成数量在合理范围内（1-100）
 * 2. 批量生成：循环调用 generateCard() 生成指定数量的卡片
 * 3. 每张卡片都是独立生成，卡号、姓名、有效期、CVV 均不同
 * 4. 返回卡片数组，如果生成失败则抛出错误
 *
 * @param brand - 品牌代码（'visa', 'mastercard', 'amex', 'unionpay', 'any' 等）
 * @param count - 生成数量（1-100）
 * @param customPrefix - 自定义 BIN/IIN 前缀（可选）
 * @param locale - 姓名地区代码（可选，默认 'en'）
 * @returns 卡片信息数组
 *
 * @example
 * // 生成 5 张 Visa 卡
 * const cards = generateCards('visa', 5)
 * // [
 * //   { number: '4532015112830366', name: 'John Smith', expiry: '08/28', cvv: '123', brand: 'Visa' },
 * //   { number: '4916338506082832', name: 'Jane Doe', expiry: '12/27', cvv: '456', brand: 'Visa' },
 * //   ...
 * // ]
 */
export type GenerateCardsFunction = (brand: string, count: number, customPrefix?: string, locale?: string) => VirtualCard[]
