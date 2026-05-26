// cspell:words FOUC TAURI Tauri tauri vueuse flac
import type { ConfigEnv, UserConfig } from 'vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { inspect } from 'node:util'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig, loadEnv } from 'vite'

import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'
import { dependencies, devDependencies, engines, name, version } from './package.json'

// Tauri v2 会在启动 Android dev 时自动注入此变量 (例如 10.0.2.2)
// 动态获取主机 IP,确保移动端热更新能连上电脑.
const host = process.env.TAURI_DEV_HOST

const proxyLog = (() => {
  const colors = {
    blue: '\x1B[34m',
    cyan: '\x1B[36m',
    dim: '\x1B[2m',
    green: '\x1B[32m',
    red: '\x1B[31m',
    reset: '\x1B[0m',
    yellow: '\x1B[33m',
  } as const
  type Color = Exclude<keyof typeof colors, 'reset'>
  const statusColors: Partial<Record<number, Color>> = { 3: 'cyan', 4: 'yellow', 5: 'red' }
  const format = (color: Color, value: string) => `${colors[color]}${value}${colors.reset}`

  return {
    format,
    status(status?: number): string {
      if (!status) {
        return format('dim', '-')
      }
      return format(statusColors[Math.min(Math.trunc(status / 100), 5)] ?? 'green', String(status))
    },
    time: () => format('dim', new Date().toLocaleTimeString('zh-CN', { hour12: false })),
  }
})()

// Vite 配置:https://cn.vitejs.dev/config
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  const enableUnoCssConfigDebug = env.VITE_DEBUG_UNOCSS_CONFIG === 'true'

  return {
    resolve: {
      // Vite 8 新特性:自动读取 tsconfig.json 中的 paths 别名
      tsconfigPaths: true,
    },
    css: {
      preprocessorOptions: {
        // 定义全局 SCSS 变量
        scss: {
          additionalData: `@use "@/assets/styles/theme/variables.css" as *;`,
        },
      },
    },
    plugins: [
      vue(),
      env.VITE_MOCK_DEV_SERVER === 'true' && mockDevServerPlugin({
        include: ['**/*.ts'],
        exclude: ['base.ts', '**/types.ts'],
      }),
      UnoCSS({
        // 启用 UnoCSS 调试面板,开发时可访问 /__unocss 查看生成样式.
        // 默认值:true
        inspector: true,
        // CSS 生成模式.
        // 'global':生成单个全局样式表(默认).
        // 'dist-chunk':构建时按 chunk 分割样式,适合多页应用.
        // 'per-module':每个模块单独生成样式,可做作用域隔离.
        // 'vue-scoped':注入到 Vue SFC 的 <style scoped>.
        // 'shadow-dom':注入到 Web Component 的 Shadow DOM.
        // 默认值:'global'
        mode: 'global',
        // 开发时 HMR 使用顶层 await,减少无样式闪烁(FOUC).
        // 默认值:true
        hmrTopLevelAwait: true,
        // UnoCSS DevTools 的 fetch 模式;某些服务器未配置 CORS 时可设为 'no-cors'.
        // 默认值:'cors'
        fetchMode: 'cors',
        // 检查项目是否正确引入 import 'uno.css'.
        // 默认值:true
        checkImport: true,
        // ==================== UnoCSS 插件选项 (PluginOptions)====================
        // 指定配置文件路径;设为 false 可禁用配置文件加载.
        // 默认值:自动查找 uno.config.ts
        // configFile: 'uno.config.standalone.ts',
        configFile: 'uno.config.ts',
        // ==================== UnoCSS 用户配置(继承自 UserConfig) ====================
        // 虚拟模块前缀.
        // 默认值:'__uno'
        virtualModulePrefix: '__uno',
        // ==================== UnoCSS 基础配置示例(ConfigBase) ====================
        // // layer 顺序.
        // layers: {
        //   components: -1,
        //   default: 1,
        //   utilities: 2,
        // },
        // // 输出为 CSS 级联层(CSS Cascade Layers).
        // outputToCssLayers: true,
        // 配置解析后的钩子:按需把 UnoCSS 最终合并后的配置写入 backup/unocss,便于排查 preset,theme,variant 和 rules 的合并结果.
        configResolved: enableUnoCssConfigDebug
          ? (config) => {
              const backupDir = resolve(process.cwd(), 'backup/unocss')
              mkdirSync(backupDir, { recursive: true })
              writeFileSync(
                resolve(backupDir, 'resolved-config.txt'),
                // UnoCSS resolved config 解析后的配置包含函数,正则和复杂对象;inspect 比 JSON.stringify 更接近 console.log 的调试输出.
                `${inspect(config, { colors: false, depth: null, maxArrayLength: null, maxStringLength: null })}\n`,
                'utf8',
              )
            }
          : undefined,

        // 暴露 UnoCSS 内部细节用于调试;默认关闭,避免日常开发输出过多信息.
        details: enableUnoCssConfigDebug,
        // ==================== 以下配置通常放在 uno.config.ts ====================
        // 例如 presets,rules,shortcuts,theme,variants,preflights,autocomplete 等.
      }),
    ],
    // 保留终端输出,避免 Vite 清屏遮住 Rust / Tauri 错误.
    // 1. 防止 Vite 清空控制台,方便看 Tauri 报错
    clearScreen: false,
    // 2. 开发服务器配置
    server: {
      // 你可以自定义端口
      // 端口需要和 tauri.conf.json 的 devUrl 保持一致.
      port: +(env.VITE_APP_PORT || 3000),
      // Tauri 需要固定端口;端口被占用时直接失败,避免连到错误服务.
      // 如果端口被占用直接报错,而不是切换端口
      strictPort: true,
      // Android / iOS dev 会通过 TAURI_DEV_HOST 指定宿主机地址.
      // 如果有 TAURI_DEV_HOST 就使用它,没有就监听 0.0.0.0 (true) 允许所有外网访问
      // 监听所有局域网 IP,供手机访问
      host: host || true,
      // 移动端开发时显式指定 HMR 地址,确保真机能连接到桌面开发服务器.
      hmr: host
        ? {
            protocol: 'ws',
            host,
            // HMR 端口与前端页面端口分离,避免 WebSocket 与页面服务互相抢占.
            port: 1421,
          }
        : undefined,
      proxy: env.VITE_APP_BASE_API && env.VITE_APP_API_URL
        ? {
            // 代理 /dev-api 的请求
            [env.VITE_APP_BASE_API]: {
              changeOrigin: true,
              // 代理目标地址:https://api.example.com
              target: env.VITE_APP_API_URL,
              rewrite: (path: string) => {
                const rewrittenPath = path.replace(new RegExp(`^${env.VITE_APP_BASE_API}`), '') || '/'
                console.log(`${proxyLog.format('cyan', '[proxy]')} ${proxyLog.time()} ${proxyLog.format('cyan', 'rewrite')} ${path} ${proxyLog.format('dim', '->')} ${rewrittenPath}`)
                return rewrittenPath
              },
              configure(proxy, options) {
                const timings = new WeakMap<object, { startedAt: number, targetUrl: string }>()

                proxy.on('proxyReq', (_proxyReq, req) => {
                  const requestUrl = req.url ?? ''
                  const targetUrl = `${String(options.target ?? '').replace(/\/$/, '')}${requestUrl.startsWith('/') ? requestUrl : `/${requestUrl}`}`
                  timings.set(req, { startedAt: Date.now(), targetUrl })
                  console.log(`${proxyLog.format('blue', '[proxy]')} ${proxyLog.time()} ${proxyLog.format('blue', req.method || 'GET')} ${req.url} ${proxyLog.format('dim', '->')} ${proxyLog.format('blue', targetUrl)}`)
                })

                proxy.on('proxyRes', (proxyRes, req) => {
                  const timing = timings.get(req)
                  const duration = timing ? `${Date.now() - timing.startedAt}ms` : '-'
                  console.log(`${proxyLog.format('green', '[proxy]')} ${proxyLog.time()} ${proxyLog.format('blue', req.method || 'GET')} ${timing?.targetUrl || req.url} ${proxyLog.format('dim', '<-')} ${proxyLog.status(proxyRes.statusCode)} ${proxyLog.format('dim', duration)}`)
                })

                proxy.on('error', (err, req) => {
                  const timing = timings.get(req)
                  const duration = timing ? `${Date.now() - timing.startedAt}ms` : '-'
                  console.error(`${proxyLog.format('red', '[proxy error]')} ${proxyLog.time()} ${proxyLog.format('red', req.method || 'GET')} ${timing?.targetUrl || req.url} ${proxyLog.format('dim', duration)}`, err)
                })
              },
            },
          }
        : undefined,
      watch: {
        // 避免监听 Tauri 工程目录,减少无关文件变更触发前端热更新.
        ignored: ['**/src-tauri/**'],
      },
    },
    preview: {
      // 预览端口和开发端口保持一致，方便在同一入口验证 Web 构建产物。
      port: +(env.VITE_APP_PORT || 3000),
      strictPort: true,
      host: true,
    },
    // 预构建常用依赖,减少首次启动开发服务器时的依赖扫描和转换成本.
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
      ],
    },
    // 只有这些前缀的环境变量会暴露给前端 import.meta.env;保留 TAURI_ENV_* 供 Tauri CLI 注入平台信息.
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    build: {
      // 未显式设置 target 时,Vite 8 使用 baseline-widely-available,避免把现代依赖错误降级到过旧浏览器目标.
      chunkSizeWarningLimit: 2000, // 提高 chunk 体积提示阈值,避免示例页大 chunk 产生无意义提示.
      // 关闭 gzip/brotli 体积计算,减少 Tauri 打包时不必要的统计耗时.
      reportCompressedSize: false,
      // Vite 8 使用 Oxc 压缩;调试构建关闭压缩,方便排查源码映射.
      minify: mode === 'production' ? 'oxc' : false,
      // Tauri 调试构建输出 sourcemap,生产构建默认不输出.
      sourcemap: !!process.env.TAURI_ENV_DEBUG,
      rollupOptions: {
        checks: {
          // @vueuse/core 当前最新包存在位置无效的 PURE 注释;关闭该检查项,而不是过滤日志输出.
          invalidAnnotation: false,
          // 不输出插件耗时统计,保持构建日志聚焦在真实错误和产物信息上.
          pluginTimings: false,
        },
        output: {
          // 如需强制拆分特定依赖,可在这里配置 manualChunks.
          // manualChunks: {
          //   "vue-i18n": ["vue-i18n"],
          // },
          // 入口 chunk 命名格式;[name] 为入口名,[hash] 为内容哈希.
          entryFileNames: 'js/[name].[hash].js',
          // 动态导入和共享 chunk 命名格式.
          chunkFileNames: 'js/[name].[hash].js',
          // 静态资源命名格式;按资源类型分目录,便于检查 Tauri 内置资源,[ext]表示文件扩展名.
          assetFileNames: (assetInfo: any) => {
            // Vite 8 / Rolldown 可能传入无 name 的资源信息,这里做空值保护.
            if (!assetInfo.name) {
              return 'assets/[name].[hash][extname]'
            }
            let extType = assetInfo.name.split('.').at(-1) || 'assets'
            // 如需排查资源分类,可临时打印 assetInfo.name.
            // console.log('文件信息', assetInfo.name)
            if (/\.(?:mp4|webm|ogg|mp3|wav|flac|aac)(?:\?.*)?$/i.test(assetInfo.name)) {
              extType = 'media'
            }
            else if (/\.(?:png|jpe?g|gif|svg)(?:\?.*)?$/.test(assetInfo.name)) {
              extType = 'img'
            }
            else if (/\.(?:woff2?|eot|ttf|otf)(?:\?.*)?$/i.test(assetInfo.name)) {
              extType = 'fonts'
            }
            return `${extType}/[name].[hash].[ext]`
          },
        },
      },

    },
    define: {
      // 平台的名称,版本,运行所需的 node 版本,依赖清单和构建时间的类型提示.
      __APP_INFO__: JSON.stringify({
        pkg: { name, version, engines, dependencies, devDependencies },
        buildTimestamp: Date.now(),
        mode,
      }),
    },
  }
})
