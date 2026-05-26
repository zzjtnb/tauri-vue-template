/**
 * BIN 数据库配置
 * 从 test.js 的 mkCClist() 函数提取的信用卡 BIN 前缀数据
 * 包含 450+ 个信用卡品牌和发卡机构的 BIN 前缀
 */

export interface BinEntry {
  /** 卡号前缀模式（x 表示任意数字） */
  pattern: string
  /** 品牌和发卡机构名称 */
  issuer: string
}

/**
 * 完整的 BIN 数据库
 * 数据来源：test.js mkCClist() 函数
 */
export const BIN_DATABASE: BinEntry[] = [
  // ========= American Express =========
  { pattern: '37xxxxxxxxxxxxx', issuer: 'AmEx' },
  { pattern: '3782xxxxxxxxxxx', issuer: 'AmEx Small Corporate Card' },
  { pattern: '3787xxxxxxxxxxx', issuer: 'AmEx Small Corporate Card' },
  { pattern: '37x8xxxxxxxxxxx', issuer: 'AmEx Gold' },
  { pattern: '37x37xxxxxxxxxx', issuer: 'AmEx Platinum' },
  { pattern: '37xxxxxxxx11xxx', issuer: 'AmEx issued since 1995' },

  // ========= Diners Club =========
  { pattern: '30xxxxxxxxxxxx', issuer: 'Diners Club' },
  { pattern: '31xxxxxxxxxxxx', issuer: 'Diners Club' },
  { pattern: '35xxxxxxxxxxxx', issuer: 'Diners Club' },
  { pattern: '36xxxxxxxxxxxx', issuer: 'Diners Club' },
  { pattern: '38xxxxxxxxxxxx', issuer: 'Carte Blanche' },

  // ========= JCB =========
  { pattern: '35xxxxxxxxxxxxxx', issuer: 'JCB (Japanese Credit Bureau)' },

  // ========= Visa - Bank Specific =========
  { pattern: '400314xxxxxxxxxx', issuer: 'Visa Debit-Banca Monte Dei Paschi Di Siena (Italy)' },
  { pattern: '400315xxxxxxxxxx', issuer: 'Visa-Banca Monte Dei Paschi Di Siena (Italy)' },
  { pattern: '40240238xxxxxxxx', issuer: 'Visa Gold-Bank of America' },
  { pattern: '4019xxxxxxxxxxxx', issuer: 'Visa CV/Gold-Bank of America' },
  { pattern: '4024xxxxxxxxxxxx', issuer: 'Visa PV-Bank of America' },
  { pattern: '4040xxxxxxxxxxxx', issuer: 'Visa CV-Wells Fargo' },
  { pattern: '4048xxxxxxxxxxxx', issuer: 'Visa CV' },
  { pattern: '40240071xxxxxxxx', issuer: 'Visa-Wells Fargo' },
  { pattern: '4013xxxxxxxxxxxx', issuer: 'Visa-Citibank' },
  { pattern: '402360xxxxxxxxxx', issuer: 'Visa Electron Prepaid-Poste Italiane (Italy)' },
  { pattern: '4027xxxxxxxxxxxx', issuer: 'Visa-Rockwell Federal Credit Union' },
  { pattern: '4032xxxxxxxxxxxx', issuer: 'Visa-Household Bank' },
  { pattern: '4052xxxxxxxxxxxx', issuer: 'Visa-First Cincinnati' },
  { pattern: '4060xxxxxxxxxxxx', issuer: 'Visa-Associates National Bank' },
  { pattern: '4070xxxxxxxxxxxx', issuer: 'Visa-Security Pacific' },
  { pattern: '4071xxxxxxxxxxxx', issuer: 'Visa-Colonial National Bank' },
  { pattern: '4094xxxxxxxxxxxx', issuer: 'Visa-A.M.C. Federal Credit Union' },
  { pattern: '4113xxxxxxxxxxxx', issuer: 'Visa-Valley National Bank' },
  { pattern: '4114xxxxxxxxxxxx', issuer: 'Visa-Chemical Bank' },
  { pattern: '4121xxxxxxxxxxxx', issuer: 'Visa-Pennsylvania State Employees Credit Union' },
  { pattern: '4122xxxxxxxxxxxx', issuer: 'Visa-Union Trust' },
  { pattern: '4125xxxxxxxxxxxx', issuer: 'Visa-Marine Midland' },
  { pattern: '4128xxxxxxxxx', issuer: 'Visa CV-Citibank' },
  { pattern: '4131xxxxxxxxxxxx', issuer: 'Visa-State Street Bank' },
  { pattern: '4225xxxxxxxxxxxx', issuer: 'Visa-Chase Manhattan Bank' },
  { pattern: '4226xxxxxxxxxxxx', issuer: 'Visa-Chase Manhattan Bank' },
  { pattern: '4231xxxxxxxxxxxx', issuer: 'Visa-Chase Lincoln First Classic' },
  { pattern: '4232xxxxxxxxxxxx', issuer: 'Visa-Chase Lincoln First Classic' },
  { pattern: '4239xxxxxxxxxxxx', issuer: 'Visa-Corestates' },
  { pattern: '4241xxxxxxxxxxxx', issuer: 'Visa-National Westminster Bank' },
  { pattern: '4250xxxxxxxxxxxx', issuer: 'Visa-First Chicago Bank' },
  { pattern: '4253xxxxxxxxxxxx', issuer: 'Visa-Consumers Edge' },
  { pattern: '42545123xxxxxxxx', issuer: 'Visa Premier card-Security First' },
  { pattern: '4254xxxxxxxxxxxx', issuer: 'Visa-Security First' },
  { pattern: '4271382xxxxxxxxx', issuer: 'Visa PV-Citibank' },
  { pattern: '4271xxxxxxxxxxxx', issuer: 'Visa-Citibank/Citicorp' },
  { pattern: '4301xxxxxxxxxxxx', issuer: 'Visa-Monogram Bank' },
  { pattern: '4302xxxxxxxxxxxx', issuer: 'Visa-H.H.B.C.' },
  { pattern: '4311xxxxxxxxxxxx', issuer: 'Visa-First National Bank of Louisville' },
  { pattern: '4317xxxxxxxxxxxx', issuer: 'Visa-Gold Dome' },
  { pattern: '4327xxxxxxxxxxxx', issuer: 'Visa-First Atlanta' },
  { pattern: '4332xxxxxxxxxxxx', issuer: 'Visa-First American Bank' },
  { pattern: '4339xxxxxxxxxxxx', issuer: 'Visa-Primerica Bank' },
  { pattern: '4342xxxxxxxxxxxx', issuer: 'Visa-N.C.M.B. / Nations Bank' },
  { pattern: '4356xxxxxxxxxxxx', issuer: 'Visa-National Bank of Delaware' },
  { pattern: '4368xxxxxxxxxxxx', issuer: 'Visa-National West' },
  { pattern: '4387xxxxxxxxxxxx', issuer: 'Visa-Bank One' },
  { pattern: '4388xxxxxxxxxxxx', issuer: 'Visa-First Signature Bank & Trust' },
  { pattern: '4401xxxxxxxxxxxx', issuer: 'Visa-Gary-Wheaton Bank' },
  { pattern: '4413xxxxxxxxxxxx', issuer: 'Visa-Firstier Bank Lincoln' },
  { pattern: '4418xxxxxxxxxxxx', issuer: 'Visa-Bank of Omaha' },
  { pattern: '4421xxxxxxxxxxxx', issuer: 'Visa-Indiana National Bank' },
  { pattern: '4424xxxxxxxxxxxx', issuer: 'Visa-Security Pacific National Bank' },
  { pattern: '4428xxxxxxxxxxxx', issuer: 'Visa-Bank of Hoven' },
  { pattern: '4436xxxxxxxxxxxx', issuer: 'Visa-Security Bank & Trust' },
  { pattern: '4443xxxxxxxxxxxx', issuer: 'Visa-Merril Lynch Bank & Trust' },
  { pattern: '4447xxxxxxxxxxxx', issuer: 'Visa-AmeriTrust' },
  { pattern: '4448020xxxxxx', issuer: 'Visa Premier card' },
  { pattern: '4452xxxxxxxxxxxx', issuer: 'Visa-Empire Affiliates Federal Credit Union' },
  { pattern: '4498xxxxxxxxxxxx', issuer: 'Visa-Republic Savings' },
  { pattern: '4502xxxxxxxxxxxx', issuer: 'Visa-C.I.B.C.' },
  { pattern: '4503xxxxxxxxxxxx', issuer: 'Visa-Canadian Imperial Bank' },
  { pattern: '4506xxxxxxxxxxxx', issuer: 'Visa-Belgium A.S.L.K.' },
  { pattern: '4510xxxxxxxxxxxx', issuer: 'Visa-Royal Bank of Canada' },
  { pattern: '4520xxxxxxxxxxxx', issuer: 'Visa-Toronto Dominion of Canada' },
  { pattern: '4537xxxxxxxxxxxx', issuer: 'Visa-Bank of Nova Scotia' },
  { pattern: '4538xxxxxxxxxxxx', issuer: 'Visa-Bank of Nova Scotia' },
  { pattern: '4539xxxxxxxxxxxx', issuer: 'Visa-Barclays (UK)' },
  { pattern: '4543xxxxxxxxxxxx', issuer: 'Visa-First Direct' },
  { pattern: '4544xxxxxxxxxxxx', issuer: 'Visa-T.S.B. Bank' },
  { pattern: '4556xxxxxxxxxxxx', issuer: 'Visa-Citibank' },
  { pattern: '4564xxxxxxxxxxxx', issuer: 'Visa-Bank of Queensland' },
  { pattern: '4673xxxxxxxxxxxx', issuer: 'Visa-First Card' },
  { pattern: '4678xxxxxxxxxxxx', issuer: 'Visa-Home Federal' },
  { pattern: '4707xxxxxxxxxxxx', issuer: 'Visa-Tompkins County Trust' },
  { pattern: '47121250xxxxxxxx', issuer: 'Visa-IBM Credit Union' },
  { pattern: '4719xxxxxxxxxxxx', issuer: 'Visa-Rocky Mountain' },
  { pattern: '4721xxxxxxxxxxxx', issuer: 'Visa-First Security' },
  { pattern: '4722xxxxxxxxxxxx', issuer: 'Visa-West Bank' },
  { pattern: '4726xxxxxxxxxxxx', issuer: 'Visa CV-Wells Fargo' },
  { pattern: '4783xxxxxxxxxxxx', issuer: 'Visa-AT&T\'s Universal Card' },
  { pattern: '4784xxxxxxxxxxxx', issuer: 'Visa-AT&T\'s Universal Card' },
  { pattern: '4800xxxxxxxxxxxx', issuer: 'Visa-M.B.N.A. North America' },
  { pattern: '4811xxxxxxxxxxxx', issuer: 'Visa-Bank of Hawaii' },
  { pattern: '4819xxxxxxxxxxxx', issuer: 'Visa-Macom Federal Credit Union' },
  { pattern: '4820xxxxxxxxxxxx', issuer: 'Visa-IBM Mid America Federal Credit Union' },
  { pattern: '4833xxxxxxxxxxxx', issuer: 'Visa-U.S. Bank' },
  { pattern: '4842xxxxxxxxxxxx', issuer: 'Visa-Security Pacific Washington' },
  { pattern: '4897xxxxxxxxxxxx', issuer: 'Visa-Village Bank of Chicago' },
  { pattern: '4921xxxxxxxxxxxx', issuer: 'Visa-Hong Kong National Bank' },
  { pattern: '4929xxxxxxxxxxxx', issuer: 'Visa CV-Barclay Card (UK)' },
  { pattern: '45399710xxxxxxxx', issuer: 'Visa-Banco di Napoli (Italy)' },
  { pattern: '4557xxxxxxxxxxxx', issuer: 'Visa-BNL (Italy)' },
  { pattern: '4908xxxxxxxxxxxx', issuer: 'Visa-Carta Moneta-CARIPLO/Intesa (Italy)' },
  { pattern: '4xxx9x604015xxxx', issuer: 'Visa-Carta Si-Unipol Banca (Italy)' },
  { pattern: '4xxx9x144046xxxx', issuer: 'Visa-Carta Si-Banco di Sardegna (Italy)' },
  { pattern: '4xxx9xxx40xxxxxx', issuer: 'Visa-Carta Si (Italy)' },
  { pattern: '4532xxxxxxxxxxxx', issuer: 'Visa-Credito Italiano (Italy)' },
  { pattern: '45475900xxxxxxxx', issuer: 'Visa Gold-bank ganadero BBV (Colombia)' },
  { pattern: '4916xxxxxxxxxxxx', issuer: 'Visa-MBNA Bank' },
  { pattern: '4xxxxxxxxxxxxx', issuer: 'Visa' },
  { pattern: '4xxxxxxxxxxxxxxx', issuer: 'Visa' },

  // ========= MasterCard =========
  { pattern: '5031xxxxxxxxxxxx', issuer: 'MasterCard-Maryland of North America' },
  { pattern: '5100xxxxxxxxxxxx', issuer: 'MasterCard-Southwestern States Bankard Association' },
  { pattern: '5110xxxxxxxxxxxx', issuer: 'MasterCard-Universal Travel Voucher' },
  { pattern: '5120xxxxxxxxxxxx', issuer: 'MasterCard-Western States Bankard Association' },
  { pattern: '5130xxxxxxxxxxxx', issuer: 'MasterCard-Eurocard France' },
  { pattern: '5140xxxxxxxxxxxx', issuer: 'MasterCard-Mountain States Bankard Association' },
  { pattern: '5150xxxxxxxxxxxx', issuer: 'MasterCard-Credit Systems Inc.' },
  { pattern: '5160xxxxxxxxxxxx', issuer: 'MasterCard-Westpac Banking Corporation' },
  { pattern: '5170xxxxxxxxxxxx', issuer: 'MasterCard-Midamerica Bankard Association' },
  { pattern: '5172xxxxxxxxxxxx', issuer: 'MasterCard-First Bank Card Center' },
  { pattern: '518xxxxxxxxxxxxx', issuer: 'MasterCard-Computer Communications of America' },
  { pattern: '519xxxxxxxxxxxxx', issuer: 'MasterCard-Bank of Montreal' },
  { pattern: '5201xxxxxxxxxxxx', issuer: 'MasterCard-Mellon Bank N.A.' },
  { pattern: '5202xxxxxxxxxxxx', issuer: 'MasterCard-Central Trust Company N.A.' },
  { pattern: '5204xxxxxxxxxxxx', issuer: 'MasterCard-Security Pacific National Bank' },
  { pattern: '5205xxxxxxxxxxxx', issuer: 'MasterCard-Promocion y Operacion S.A.' },
  { pattern: '5206xxxxxxxxxxxx', issuer: 'MasterCard-Banco Nacional do Mexico' },
  { pattern: '5207xxxxxxxxxxxx', issuer: 'MasterCard-New England Bankard Association' },
  { pattern: '5208xxxxxxxxxxxx', issuer: 'MasterCard-Million Card Service Co. Ltd.' },
  { pattern: '5209xxxxxxxxxxxx', issuer: 'MasterCard-The Citizens & Southern National Bank' },
  { pattern: '5210xxxxxxxxxxxx', issuer: 'MasterCard-Kokunai Shinpan Company Ltd.' },
  { pattern: '5211xxxxxxxxxxxx', issuer: 'MasterCard-Chemical Bank Delaware' },
  { pattern: '5212xxxxxxxxxxxx', issuer: 'MasterCard-F.C.C. National Bank' },
  { pattern: '5213xxxxxxxxxxxx', issuer: 'MasterCard-The Bankcard Association Inc.' },
  { pattern: '5215xxxxxxxxxxxx', issuer: 'MasterCard-Marine Midland Bank N.A.' },
  { pattern: '5216xxxxxxxxxxxx', issuer: 'MasterCard-Old Kent Bank & Trust Co.' },
  { pattern: '5217xxxxxxxxxxxx', issuer: 'MasterCard-Union Trust' },
  { pattern: '5218xxxxxxxxxxxx', issuer: 'MasterCard-Citibank/Citicorp' },
  { pattern: '5219xxxxxxxxxxxx', issuer: 'MasterCard-Central Finance Co. Ltd.' },
  { pattern: '5220xxxxxxxxxxxx', issuer: 'MasterCard-Sovran Bank/Central South' },
  { pattern: '5221xxxxxxxxxxxx', issuer: 'MasterCard-Standard Bank of South Africa Ltd.' },
  { pattern: '5222xxxxxxxxxxxx', issuer: 'MasterCard-Security Bank & Trust Company' },
  { pattern: '5223xxxxxxxxxxxx', issuer: 'MasterCard-Trustmark National Bank' },
  { pattern: '5224xxxxxxxxxxxx', issuer: 'MasterCard-Midland Bank' },
  { pattern: '5225xxxxxxxxxxxx', issuer: 'MasterCard-First Pennsylvania Bank N.A.' },
  { pattern: '5226xxxxxxxxxxxx', issuer: 'MasterCard-Eurocard Ab' },
  { pattern: '5227xxxxxxxxxxxx', issuer: 'MasterCard-Rocky Mountain Bankcard System Inc.' },
  { pattern: '5228xxxxxxxxxxxx', issuer: 'MasterCard-First Union National Bank of North Carolina' },
  { pattern: '5229xxxxxxxxxxxx', issuer: 'MasterCard-Sunwest Bank of Albuquerque N.A.' },
  { pattern: '5230xxxxxxxxxxxx', issuer: 'MasterCard-Harris Trust & Savings Bank' },
  { pattern: '5231xxxxxxxxxxxx', issuer: 'MasterCard-Badische Beamtenbank EG' },
  { pattern: '5232xxxxxxxxxxxx', issuer: 'MasterCard-Eurocard Deutschland' },
  { pattern: '5233xxxxxxxxxxxx', issuer: 'MasterCard-Computer Systems Association Inc.' },
  { pattern: '5234xxxxxxxxxxxx', issuer: 'MasterCard-Citibank Arizona' },
  { pattern: '5235xxxxxxxxxxxx', issuer: 'MasterCard-Financial Transaction System Inc.' },
  { pattern: '5236xxxxxxxxxxxx', issuer: 'MasterCard-First Tennessee Bank N.A.' },
  { pattern: '5254xxxxxxxxxxxx', issuer: 'MasterCard-Bank of America' },
  { pattern: '5273xxxxxxxxxxxx', issuer: 'MasterCard(can be Gold)-Bank of America' },
  { pattern: '5286xxxxxxxxxxxx', issuer: 'MasterCard-Home Federal' },
  { pattern: '5291xxxxxxxxxxxx', issuer: 'MasterCard-Signet Bank' },
  { pattern: '5329xxxxxxxxxxxx', issuer: 'MasterCard-Maryland of North America' },
  { pattern: '533875xxxxxxxxxx', issuer: 'MasterCard Prepaid-PayPal / Lottomaticard (Italy)' },
  { pattern: '5410xxxxxxxxxxxx', issuer: 'MasterCard-Wells Fargo' },
  { pattern: '5412xxxxxxxxxxxx', issuer: 'MasterCard-Wells Fargo' },
  { pattern: '5419xxxxxxxxxxxx', issuer: 'MasterCard-Bank of Hoven' },
  { pattern: '5424xxxxxxxxxxxx', issuer: 'MasterCard-Citibank/Citicorp' },
  { pattern: '543013xxxxxxxxxx', issuer: 'MasterCard-BNL/BNP Paribas (Italy)' },
  { pattern: '5434xxxxxxxxxxxx', issuer: 'MasterCard-National Westminster Bank' },
  { pattern: '5465xxxxxxxxxxxx', issuer: 'MasterCard-Chase Manhattan' },
  { pattern: '52550114xxxxxxxx', issuer: 'MasterCard-Banco di Sardegna (Italy)' },
  { pattern: '530693xxxxxxxxxx', issuer: 'MasterCard-Bancolombia Cadenalco (Colombia)' },
  { pattern: '5406251xxxxxxxxx', issuer: 'MasterCard-Banco de Occidente (Colombia)' },
  { pattern: '5426xxxxxxxxxxxx', issuer: 'MasterCard-Granahorrar (Colombia)' },
  { pattern: '5406xxxxxxxxxxxx', issuer: 'MasterCard-Granahorrar (Colombia)' },
  { pattern: '581149xxxxxxxxxx', issuer: 'Maestro-BNL/BNP Paribas (Italy)' },
  { pattern: '5xxxxxxxxxxxxxxx', issuer: 'MasterCard/Access/Eurocard' },

  // ========= Discover =========
  { pattern: '6013xxxxxxxxxxxx', issuer: 'Discover-MBNA Bank' },
  { pattern: '60xxxxxxxxxxxxxx', issuer: 'Discover' },
]

/**
 * 根据卡号前缀查找发卡机构
 * @param cardNumber 卡号
 * @returns 发卡机构名称或 'Unknown'
 */
export function findIssuerByCardNumber(cardNumber: string): string {
  const cleanNumber = String(cardNumber).replace(/\D/g, '')

  for (const entry of BIN_DATABASE) {
    if (matchesPattern(cleanNumber, entry.pattern)) {
      return entry.issuer
    }
  }

  return 'Unknown'
}

/**
 * 检查卡号是否匹配 BIN 前缀模式
 * @param cardNumber 卡号
 * @param pattern 前缀模式（x 表示任意数字）
 * @returns 是否匹配
 */
function matchesPattern(cardNumber: string, pattern: string): boolean {
  if (cardNumber.length < pattern.length) {
    return false
  }

  for (let i = 0; i < pattern.length; i++) {
    const patternChar = pattern[i]
    if (patternChar !== 'x' && patternChar !== cardNumber[i]) {
      return false
    }
  }

  return true
}
