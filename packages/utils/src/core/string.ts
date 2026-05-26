/**
 * 把任意字符串转换成可用于文件名片段的安全字符串。
 *
 * 只保留字母、数字、下划线和短横线，其它连续字符会被替换成 `-`。
 * 这个函数只处理“单个文件名片段”，不处理目录路径。
 *
 * @param sourceText - 待转换的原始字符串。
 * @returns 可用于文件名片段的字符串。
 * @public
 */
export function toSafeFileSegment(sourceText: string): string {
  return sourceText.replace(/[^\w-]+/g, '-')
}
