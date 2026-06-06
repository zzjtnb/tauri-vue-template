# Template 模板应用

独立模板应用，承载模板选择页、模板骨架、设置页、模板 API、Mock 和模板级 Pinia 状态。

## 应用边界

### 职责

- 承载模板选择页、模板骨架、设置页、模板 API、Mock 和模板级 Pinia 状态
- 可以作为纯 Web 应用独立运行，也可以被 `apps/tauri` 通过公共路由入口聚合进多端安装包
- 默认端口：`3001`

### 边界

**✅ 包含：**

- 模板页面、设置页
- Mock API、Pinia store、业务 API
- 模板级路由和状态管理

**❌ 不包含：**

- src-tauri、原生打包配置
- 示例演示页面

**设计原则：**

- 避免模板业务和打包器职责混在一起
- 保持模板应用的独立性和可移植性

## 快速开始

启动开发服务器：

```bash
# 在根目录
pnpm --filter @tauri-vue-template/template dev

# 或在当前目录
pnpm dev
```

访问：`http://localhost:3001`

构建生产产物：

```bash
# 在根目录
pnpm --filter @tauri-vue-template/template build

# 或在当前目录
pnpm build
```

## 内置页面

- `/`：模板选择页
- `/topnav`：顶部导航模板
- `/sidebar`：侧边栏布局模板
- `/hybrid`：混合布局模板
- `/blank`：空白布局模板
- `/workspace`：智能工作台自定义模板
- `/settings`：设置页，包含主题布局、桌面与文件、系统信息
