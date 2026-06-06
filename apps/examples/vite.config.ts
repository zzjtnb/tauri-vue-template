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

// Tauri v2 会在启动 Android dev 时自动注入此变量，例如 10.0.2.2。
// 动态获取主机 IP，确保移动端热更新能连上电脑。
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

// Vite 配置：https://cn.vitejs.dev/config
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Vite 只会把 VITE_* 暴露到前端；这里读取 mode 对应的 .env，仅用于构建配置本身。
  const env = loadEnv(mode, process.cwd())

  // UnoCSS 配置调试开关：需要排查 preset、theme、variant、rules 合并结果时写出 resolved config。
  const enableUnoCssConfigDebug = env.VITE_DEBUG_UNOCSS_CONFIG === 'true'

  return {
    // 默认 public 静态资源来自共享 assets 包；应用只在需要品牌覆盖时再恢复自己的 public/。
    publicDir: resolve(process.cwd(), '../../packages/assets/public'),
    resolve: {
      // Vite 8 自动读取 tsconfig paths；workspace 包通过 package.json exports 解析到源码。
      tsconfigPaths: true,
      // ui 包内部仍使用 @ui/*，应用侧打包 ui 源码时需要这一条 alias。
      alias: [
        { find: /^@ui\/(.+)$/, replacement: resolve(process.cwd(), '../../packages/ui/src/$1') },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 应用消费 theme 包里的全局变量入口，避免在 app 内复制一套主题变量。
          additionalData: `@use "@tauri-vue-template/theme/styles/theme/variables.css" as *;`,
        },
      },
    },
    plugins: [
      // Vue SFC 编译入口；应用页面使用 Composition API 和 <script setup lang="ts">。
      vue(),
      // Mock 服务只在显式启用时注册，避免生产构建和真实接口环境混入本地 mock 行为。
      env.VITE_MOCK_DEV_SERVER === 'true' && mockDevServerPlugin({
        include: ['**/*.ts'],
        exclude: ['base.ts', '**/types.ts'],
      }),
      UnoCSS({
        // 保留 UnoCSS 调试面板，便于在应用里检查主题、布局和 shadcn-vue 组件最终生成的原子类。
        inspector: true,
        // 使用全局 CSS 输出，避免同一组件在不同环境中层级行为不一致。
        mode: 'global',
        // 开发期减少 UnoCSS HMR 导致的无样式闪烁；生产构建不会引入额外运行时代码。
        hmrTopLevelAwait: true,
        // DevTools 拉取调试信息时使用浏览器默认 CORS 行为；如需内网调试再单独覆盖。
        fetchMode: 'cors',
        // 检查 main.ts 是否显式引入 uno.css，防止应用缺少原子样式入口。
        checkImport: true,
        // ==================== UnoCSS 插件选项 (PluginOptions) ====================
        // 应用拥有自己的 uno.config.ts，路径独立，便于后续只扩展应用扫描范围。
        // 指定配置文件路径；设为 false 可禁用配置文件加载。默认值：自动查找 uno.config.ts。
        configFile: 'uno.config.ts',
        // ==================== UnoCSS 用户配置（继承自 UserConfig） ====================
        // 保持虚拟模块前缀一致，避免类型声明、调试工具和构建产物出现两套约定。
        // 默认值：'__uno'。
        virtualModulePrefix: '__uno',
        configResolved: enableUnoCssConfigDebug
          ? (config) => {
              const backupDir = resolve(process.cwd(), 'backup/unocss')
              mkdirSync(backupDir, { recursive: true })
              writeFileSync(
                resolve(backupDir, 'resolved-config.txt'),
                // UnoCSS resolved config 包含函数、正则和复杂对象；inspect 比 JSON.stringify 更适合保留调试信息。
                `${inspect(config, { colors: false, depth: null, maxArrayLength: null, maxStringLength: null })}\n`,
                'utf8',
              )
            }
          : undefined,

        // 暴露 UnoCSS 内部细节用于调试；默认关闭，避免日常开发输出过多信息。
        // details 默认关闭；只有显式打开 VITE_DEBUG_UNOCSS_CONFIG 时才输出内部细节。
        details: enableUnoCssConfigDebug,
        // ==================== 以下配置通常放在 uno.config.ts ====================
        // 例如 presets、rules、shortcuts、theme、variants、preflights、autocomplete 等。
      }),
    ],
    // 保留终端输出，避免 Vite 清屏盖住类型检查、Mock 代理或 Tauri 聚合调试错误。
    clearScreen: false,
    server: {
      // 应用开发服务端口，从环境变量读取。
      port: +(env.VITE_APP_PORT || 3000),
      // 应用入口应稳定，端口被占用时直接失败，避免调试时打开错误应用。
      strictPort: true,
      // Android / iOS dev 会通过 TAURI_DEV_HOST 指定宿主机地址。
      // 如果有 TAURI_DEV_HOST 就使用它；没有就监听 0.0.0.0（true），允许局域网访问。
      host: host || true,
      // 移动端开发时显式指定 HMR 地址，确保真机能连接到桌面开发服务器。
      hmr: host
        ? {
            protocol: 'ws',
            host,
            // HMR 端口与前端页面端口分离，避免 WebSocket 与页面服务互相抢占。
            port: 1421,
          }
        : undefined,
      // 只有同时配置前缀和后端地址时才注册开发代理，避免空代理吞掉真实请求。
      proxy: env.VITE_APP_BASE_API && env.VITE_APP_API_URL
        ? {
            // 代理 /dev-api 等模板 API 请求。
            [env.VITE_APP_BASE_API]: {
              changeOrigin: true,
              // 代理目标地址，例如 https://api.example.com。
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
        // 避免监听 Tauri 工程目录，减少无关文件变更触发前端热更新。
        ignored: ['**/src-tauri/**'],
      },
    },
    preview: {
      // 预览端口和开发端口保持一致，方便在同一入口验证应用产物。
      port: +(env.VITE_APP_PORT || 3000),
      strictPort: true,
      host: true,
    },
    // 预构建高频依赖，减少首次打开模板页、设置页和 Pinia 状态相关页面时的依赖扫描成本。
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
      ],
    },
    // 应用会被 Tauri 聚合调试，保留 TAURI_ENV_* 供平台信息透传。
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    build: {
      // 应用页面会形成较大的 chunk；提高阈值让日志聚焦真实问题。
      chunkSizeWarningLimit: 2000,
      // 关闭压缩体积统计，加快应用构建反馈。
      reportCompressedSize: false,
      // 生产构建使用 Vite 8 / Rolldown 的 Oxc 压缩，非生产保留可读输出。
      minify: mode === 'production' ? 'oxc' : false,
      // Tauri 调试构建输出 sourcemap，生产构建默认不输出。
      sourcemap: !!process.env.TAURI_ENV_DEBUG,
      rollupOptions: {
        checks: {
          // @vueuse/core 当前包内存在位置无效的 PURE 注释；关闭该检查项，而不是过滤所有构建日志。
          invalidAnnotation: false,
          // 不输出插件耗时统计，保持构建日志聚焦错误和产物信息。
          pluginTimings: false,
        },
        output: {
          // 如需强制拆分特定依赖，可在这里配置 manualChunks。
          // manualChunks: {
          //   "vue-i18n": ["vue-i18n"],
          // },
          // 入口 chunk 命名格式；[name] 为入口名，[hash] 为内容哈希。
          entryFileNames: 'js/[name].[hash].js',
          // 动态导入和共享 chunk 命名格式。
          chunkFileNames: 'js/[name].[hash].js',
          // 静态资源命名格式；按资源类型分目录，便于检查 Tauri 内置资源，[ext] 表示文件扩展名。
          assetFileNames: (assetInfo: any) => {
            // Vite 8 / Rolldown 可能传入无 name 的资源信息，这里做空值保护。
            if (!assetInfo.name) {
              return 'assets/[name].[hash][extname]'
            }
            let extType = assetInfo.name.split('.').at(-1) || 'assets'
            // 如需排查资源分类，可临时打印 assetInfo.name。
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
      // 注入应用自身的包信息，供关于页、调试面板或运行时环境展示使用。
      __APP_INFO__: JSON.stringify({
        pkg: { name, version, engines, dependencies, devDependencies },
        buildTimestamp: Date.now(),
        mode,
      }),
    },
  }
})
