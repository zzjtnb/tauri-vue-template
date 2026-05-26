import { createApp } from 'vue'
import { router } from '@/router'
import { pinia } from '@/stores'
import App from './App.vue'
// 导入 UnoCSS Vite 样式入口；@unocss/vite 同时兼容 `uno.css` 和 `virtual:uno.css`，项目保留插件提示使用的短入口。
// UnoCSS 会先声明 resolved layers 的默认顺序；项目样式只挂到既有 layer，避免手写内部层级顺序。
import 'uno.css'
// 导入主题、基础、安全区和第三方分层样式；具体层级顺序由 UnoCSS resolved layers 建立。
import '@/assets/styles/index.css'
// 导入 Sonner 样式；该包样式未接入项目 CSS layer，保留原始第三方入口。
import 'vue-sonner/style.css'
// 导入 UnoCSS DevTools 虚拟模块；`virtual:` 表示该模块由 @unocss/vite 动态解析，不是磁盘上的真实文件。
// 这是可选的开发期调试能力：开发服务会注入 DevTools 客户端和空类名规则，方便浏览器 DevTools 自动补全工具类。
// Vite 生产构建会把该虚拟模块解析为空模块，不会把这些调试规则写入最终产物。
import 'virtual:unocss-devtools'

const app = createApp(App)
// ✅ 安装 Pinia Store（包含持久化插件）
app.use(pinia)
app.use(router)
app.mount('#app')
