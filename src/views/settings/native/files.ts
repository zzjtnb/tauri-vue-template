import { appDataDir, join } from '@tauri-apps/api/path'
import { BaseDirectory, mkdir, readDir, readTextFile, stat, writeTextFile } from '@tauri-apps/plugin-fs'
import { upload } from '@tauri-apps/plugin-upload'
import { shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { pending, runAction } from './actions'
import { platform } from './runtime'

export interface FsScopeMeta {
  label: string
  permission: string
  status: string
  entries: number
  directory: boolean
  readonly: boolean
  error: string
}

/** AppData 示例文件绝对路径；由写入动作生成。 */
export const samplePath = shallowRef('')

/** AppData 示例文件内容；由写入/读取动作更新。 */
export const sampleContent = shallowRef('')

/** 下载、文档、图片目录元信息读取结果。 */
export const scopeMetas = shallowRef<FsScopeMeta[]>([])

/** 原生 upload 插件上传状态。 */
export const uploadStatus = shallowRef('未上传')

/** 原生 upload 插件上传进度百分比。 */
export const uploadProgress = shallowRef(0)

const sampleDir = 'template-demo'
const sampleFile = `${sampleDir}/native-sample.json`

/** 写入 AppData 示例文件，对应 fs:allow-appdata-write-recursive。 */
export async function writeSampleFile(): Promise<void> {
  await runAction(pending.fsWrite, async () => {
    await persistSampleFile()
    toast.success('示例文件已写入应用数据目录')
  })
}

/** 读取 AppData 示例文件；fs:default 已允许应用专属目录读取。 */
export async function readSampleFile(): Promise<void> {
  await runAction(pending.fsRead, async () => {
    if (!samplePath.value) {
      await persistSampleFile()
    }
    sampleContent.value = await readTextFile(sampleFile, { baseDir: BaseDirectory.AppData })
    toast.success('示例文件已读取')
  })
}

/** 读取下载、文档、图片目录元信息，对应三个 *-meta-recursive 权限。 */
export async function inspectFsMetaScopes(): Promise<void> {
  await runAction(pending.fsMeta, async () => {
    scopeMetas.value = await Promise.all([
      inspectFsMetaScope('下载目录', 'fs:allow-download-meta-recursive', BaseDirectory.Download),
      inspectFsMetaScope('文档目录', 'fs:allow-document-meta-recursive', BaseDirectory.Document),
      inspectFsMetaScope('图片目录', 'fs:allow-picture-meta-recursive', BaseDirectory.Picture),
    ])
    toast.success('目录元信息已读取')
  })
}

/** 上传 AppData 示例文件，对应 upload:default。 */
export async function uploadSampleFile(): Promise<void> {
  await runAction(pending.uploadSample, async () => {
    const uploadUrl = resolveUploadDemoUrl()
    if (!uploadUrl) {
      throw new Error('请配置 VITE_UPLOAD_DEMO_URL，或配置绝对地址形式的 VITE_APP_API_URL 后再上传示例文件')
    }

    const filePath = samplePath.value || await persistSampleFile()
    uploadProgress.value = 0
    uploadStatus.value = '上传中'
    const response = await upload(
      uploadUrl,
      filePath,
      (progress) => {
        uploadProgress.value = progress.total > 0
          ? Math.min(100, Math.round((progress.progressTotal / progress.total) * 100))
          : 0
      },
      undefined,
    )
    uploadProgress.value = 100
    uploadStatus.value = response || '上传完成'
    toast.success('示例文件已上传')
  })
}

async function inspectFsMetaScope(label: string, permission: string, baseDir: BaseDirectory): Promise<FsScopeMeta> {
  try {
    const [info, entries] = await Promise.all([
      stat('.', { baseDir }),
      readDir('.', { baseDir }),
    ])

    return {
      label,
      permission,
      status: '可读取元信息',
      entries: entries.length,
      directory: info.isDirectory,
      readonly: info.readonly,
      error: '',
    }
  }
  catch (error) {
    return {
      label,
      permission,
      status: '读取失败',
      entries: 0,
      directory: false,
      readonly: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function persistSampleFile(): Promise<string> {
  await mkdir(sampleDir, { baseDir: BaseDirectory.AppData, recursive: true })
  const content = JSON.stringify({
    source: 'tauri-vue-template',
    platform: platform.value?.name ?? 'unknown',
    writtenAt: new Date().toISOString(),
  }, null, 2)

  await writeTextFile(sampleFile, content, { baseDir: BaseDirectory.AppData })
  samplePath.value = await join(await appDataDir(), sampleFile)
  sampleContent.value = content
  return samplePath.value
}

function resolveUploadDemoUrl(): string {
  const explicitUrl = import.meta.env.VITE_UPLOAD_DEMO_URL?.trim()
  if (explicitUrl) {
    return explicitUrl
  }

  const apiUrl = import.meta.env.VITE_APP_API_URL?.trim()
  if (apiUrl && /^https?:\/\//.test(apiUrl)) {
    return `${apiUrl.replace(/\/$/, '')}/api/template/upload`
  }

  return ''
}
