/**
 * 共享静态资源包契约校验。
 *
 * `packages/assets` 被 Web 应用、Tauri 配置和 CLI 同时消费，因此必需资源必须存在、可读且非空。
 */
import { accessSync, constants, statSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const assetsRoot = resolve(import.meta.dirname, '..')

// 这份清单保持小而明确：每一项都是资源包运行时契约的一部分。
const requiredAssets = [
  'public/favicon.ico',
  'public/logo.png',
  'public/splashscreen.html',
]

/** 校验共享静态资源是否存在、可读且非空。 */
export function validatePublicAssets(): void {
  for (const asset of requiredAssets) {
    const assetPath = resolve(assetsRoot, asset)
    accessSync(assetPath, constants.R_OK)

    if (statSync(assetPath).size === 0)
      throw new Error(`公共静态资源不能为空：${asset}`)
  }

  console.log('共享静态资源校验通过：packages/assets/public/')
}

if (typeof process.argv[1] === 'string' && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  validatePublicAssets()
