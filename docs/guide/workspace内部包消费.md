# Workspace 内部包消费

本仓库的 `packages/theme`、`packages/ui`、`packages/utils` 只供 monorepo 内应用消费，**不发布 npm**。应用 `dev` 与 `build` 一律解析到各包 **源码（`src/`）**，不依赖各包 `dist/`。

## 解析规则

| 项 | 约定 |
| --- | --- |
| 依赖声明 | 应用 `package.json` 使用 `"@tauri-vue-template/<name>": "workspace:*"` |
| 模块解析 | 各包 `package.json` 的 `exports` / `types` / `import` 指向 `./src/**` |
| 应用导入 | 使用正式包名，例如 `@tauri-vue-template/ui`、`@tauri-vue-template/utils/http` |
| 禁止方式 | 应用级 `package.json#imports` 的 `#packages/*`、跨包相对路径、`exports` 指向 `dist` 供应用消费 |

## 分入口（theme）

| 入口 | 用途 |
| --- | --- |
| `@tauri-vue-template/theme/styles` | 应用 `main.ts` 加载全局 CSS |
| `@tauri-vue-template/theme/unocss` | 应用 `uno.config.ts` 的 `createUnoConfig`（**不要**从包根 `.` 导入，根入口含 CSS 副作用，Node/jiti 无法加载） |
| `@tauri-vue-template/theme/styles/*` | 按需引用子样式（如 SCSS 变量） |

## Vite 应用配置

- `resolve.tsconfigPaths: true`，`@/*` 只指向本应用 `src`。
- workspace 包由 `exports` 解析到源码，**不要**为 `@tauri-vue-template/*` 写 `resolve.alias` 指向 `dist`。
- ui 包内部使用 `@ui/*`；应用 `vite.config.ts` 保留一条 alias：`@ui/*` → `packages/ui/src/*`。

应用 `tsconfig.app.json` 只需维护 `@/*` 与 `@ui/*` paths，不要为 `@tauri-vue-template/*` 重复写相对路径映射。

## Turborepo

| 任务 | 行为 |
| --- | --- |
| `dev` / `preview` | 不 `dependsOn: ["^build"]` |
| 应用 `build` | `dependsOn: []`；Vite 直接从 workspace 源码打包，不等待内部包 `build` |
| 内部包 `build` | 根 `turbo run build` 仍会构建 `packages/*/dist`，仅用于 CI、类型产物校验或 CLI；**不是**应用 dev 的前置条件 |

## 各包 `build` 的含义

- **`theme` / `utils`**：`tsdown` 输出 `dist/`，供包级校验，应用不消费。
- **`ui`**：`vite build` 输出 `dist/`，供包级校验，应用不消费。
- **`cli`**：`exports` 指向 `dist/` 供程序化 import；日常 `pnpm --filter @tauri-vue-template/cli …` 直接执行 `src/**/*.ts`，**无需**先 `build`。与前端应用消费方式无关。

## 验证

```bash
pnpm --filter @tauri-vue-template/examples type-check
pnpm --filter @tauri-vue-template/template type-check
pnpm --filter @tauri-vue-template/examples build
pnpm --filter @tauri-vue-template/template build
pnpm dev --dry=text
```

`dev --dry=text` 的 `Tasks to Run` 中不应出现内部包的 `build` 任务。
