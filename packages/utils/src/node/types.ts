/** 文件查找谓词。 */
export type FilePredicate = (filePath: string) => boolean

/** JSON 文件写入选项。 */
export interface WriteJsonOptions {
  /** 是否输出单行 JSON；默认 false，使用两空格缩进。 */
  compact?: boolean
}

/** 路径相对化输入。 */
export interface RelativePathInput {
  /** 作为相对路径基准的根目录。 */
  rootDir: string
  /** 需要转换的目标路径。 */
  targetPath: string
}

/** 路径包含关系校验输入。 */
export interface AssertInsidePathInput extends RelativePathInput {
  /** 错误提示中展示的目标名称。 */
  label: string
}

/** 命令行输入路径解析输入。 */
export interface ResolveInputPathInput extends RelativePathInput {}
