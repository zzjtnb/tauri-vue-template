# Examples 示例应用

独立的演示应用，展示 `@tauri-vue-template/ui` 聚合出的布局、shadcn-vue 组件和示例工具页面运行效果。

## 应用边界

### 职责

- 只展示 `@tauri-vue-template/ui` 聚合出的布局、shadcn-vue 组件和示例工具页面运行效果
- 可被 `apps/tauri` 作为前端入口聚合进多端安装包，因此保留 Tauri dev host、HMR 和调试 sourcemap 配置
- 默认端口：`3000`（作为演示基准，其他应用按 3001、3002 继续顺延）

### 边界

**✅ 包含：**

- 组件演示、主题演示、布局演示
- Logo 编辑器、字体系统、虚拟信用卡等示例页面

**❌ 不包含：**

- Tauri CLI、src-tauri
- Mock API、Pinia 持久化、业务 API

**设计原则：**

- 避免演示能力反向污染模板应用
- 和模板应用共用同一套样式资产与 UnoCSS 规则，保证组件视觉和布局行为一致

## 快速开始

启动开发服务器：

```bash
# 在根目录
pnpm --filter @tauri-vue-template/examples dev

# 或在当前目录
pnpm dev
```

访问：`http://localhost:3000`

构建生产产物：

```bash
# 在根目录
pnpm --filter @tauri-vue-template/examples build

# 或在当前目录
pnpm build
```

## 内置页面

- `/`：示例总览
- `/fonts`：字体系统演示
- `/themes`：主题配色演示
- `/shadcn`：shadcn-vue 组件演示
- `/card`：虚拟信用卡示例
- `/logo`：Logo 编辑器演示
- `/mock`：Mock API 演示
