# Turborepo 任务规范

本文记录本仓库 Turborepo 任务的标准边界，尤其是 `dev`、`preview` 这类长驻任务的配置方式。目标是让根脚本保持稳定，让每个 workspace 包自己声明能力，避免根目录用 `--filter` 维护会随应用数量变化的任务范围。根级全仓库 lint 和指向单一 CLI 工具的 `format` 是明确例外。

## 核心原则

| 原则 | 标准 |
| --- | --- |
| 根脚本按任务类型分层 | `dev`、`preview`、`build`、`type-check` 委托 `turbo run <task>`；`clean` / `clear` 为根目录 shell 脚本；全仓库 ESLint / Stylelint / Markdownlint 直接用根 `pnpm` 脚本执行。 |
| 包自己声明能力 | 一个包是否参与 workspace 任务，只由该包自己的 `package.json scripts` 决定。 |
| 包自己声明特殊运行特性 | `persistent`、`cache: false`、包级 outputs/env/inputs 放在对应包的 `turbo.json`。 |
| 根配置只放 Turbo 调度任务 | 根 `turbo.json` 只声明真正通过 Turbo 调度的任务，例如 `build`、`type-check`、`format` 和包内 `lint:rust`。 |
| 不用 root filter 维护项目集合 | 根脚本不要用 `--filter` 枚举应用集合；`format` 指向唯一 CLI 包是固定工具入口，不代表项目集合。 |
| 不造假任务 | 不给公共包、CLI 包、Tauri 打包器添加空的 `dev` / `preview` 脚本来迎合 Turbo。 |

## 根脚本标准

根 `package.json` 按任务类型分层：

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "type-check": "turbo run type-check",
    "preview": "turbo run preview",
    "clean": "rm -rf node_modules/.tmp node_modules/.cache apps/*/node_modules/.tmp ...",
    "clear": "rm -rf dist node_modules .turbo apps/*/dist ...",
    "format": "pnpm --filter @tauri-vue-template/cli format",
    "lint:eslint": "eslint . --fix --cache --cache-location node_modules/.cache/.eslintcache --config eslint.config.ts",
    "lint:stylelint": "stylelint \"**/*.{css,scss,vue,html}\" --config stylelint.config.ts --fix --cache --cache-location node_modules/.cache/.stylelintcache",
    "lint:markdownlint": "markdownlint-cli2 --config .markdownlint-cli2.jsonc --fix \"**/*.md\"",
    "lint": "pnpm lint:eslint && pnpm lint:stylelint && pnpm lint:markdownlint && turbo run lint:rust",
    "lint:tui": "pnpm lint:eslint && pnpm lint:stylelint && pnpm lint:markdownlint && turbo run lint:rust --ui=tui"
  }
}
```

其中 `dev`、`preview`、`build`、`type-check` 是标准 workspace 调度；`clean` 只清理各包缓存与临时产物，`clear` 会删除 `dist`、`node_modules`、`.turbo` 等（破坏性更强，按需使用）；`lint:eslint`、`lint:stylelint`、`lint:markdownlint` 直接在仓库根执行全局扫描；`lint:rust` 仍通过 Turbo 调度到真正声明该能力的 `apps/tauri`；`format` 固定进入 CLI 包的交互选择器。

不要这样写：

```json
{
  "scripts": {
    "dev": "turbo run dev --filter @tauri-vue-template/examples --filter @tauri-vue-template/template",
    "preview": "turbo run preview --filter=./apps/*"
  }
}
```

原因：根脚本一旦写 `--filter`，根目录就需要知道哪些项目应该参与任务。以后新增 10 个或 100 个应用时，会把项目集合维护成本推回根目录，违背 workspace 包自治。

## 根 `turbo.json` 标准

根 `turbo.json` 只放真正通过 Turbo 调度的任务，例如：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "node_modules/.tmp/**"]
    },
    "preview": {
      "cache": false
    },
    "transit": {
      "dependsOn": ["^transit"]
    },
    "type-check": {
      "dependsOn": ["transit"],
      "outputs": ["node_modules/.tmp/**"]
    },
    "format": {
      "cache": false
    },
    "lint:rust": {
      "cache": false
    }
  }
}
```

根级 `preview` 只声明 `cache: false`；`persistent: true` 写在各应用 `apps/*/turbo.json` 的 `preview` 任务里。`dev` 不在根 `turbo.json` 定义，同样由各应用包级 `turbo.json` 声明。

不要在根 `turbo.json` 里定义只属于少数应用的长驻任务：

```json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "preview": {
      "cache": false,
      "persistent": true
    }
  }
}
```

原因：根级 task 定义会让 Turbo 把该任务视为全 workspace 的任务定义。即使某些包没有 `dev` / `preview` 脚本，dry-run 中也可能出现 `<NONEXISTENT>` 任务，任务图会变脏。

## 应用包标准

真正有 dev server 的应用包，应该在自己的 `package.json` 中声明能力：

```json
{
  "scripts": {
    "dev": "vite",
    "preview": "vite preview"
  }
}
```

并在同级 `turbo.json` 中声明长驻任务特性：

```json
{
  "extends": ["//"],
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "preview": {
      "cache": false,
      "persistent": true
    }
  }
}
```

这样新增应用时，只需要新增该应用自己的脚本和包级 Turbo 配置，根目录不需要改。

## 公共包标准

公共包、类型包、组件包、CLI 包默认不应该声明 `dev` / `preview`，除非它们真的有独立长驻开发服务。

不要为了让根开发任务看起来整齐而添加空脚本：

```json
{
  "scripts": {
    "dev": "echo noop"
  }
}
```

这种做法会制造假能力，让调用者误以为公共包可以独立启动开发服务。

## Tauri 打包器标准

`apps/tauri` 是原生打包器，不是普通 Web dev server。它不参与根 `pnpm dev`。

Tauri 开发入口应该通过明确的 Tauri 目标命令执行，例如：

```bash
pnpm --filter @tauri-vue-template/cli tauri:target -- dev --target template
```

这样可以显式选择应用目标，避免根 `pnpm dev` 同时启动 Web dev server 和 Tauri 原生调试流程。

## 验证标准

修改 `dev` / `preview` 任务配置后，不要直接启动长驻服务验证；先使用 dry-run 查看任务图：

```bash
pnpm dev --dry=text
pnpm preview --dry=text
```

正确结果应满足：

- `Tasks to Run` 只包含真正拥有对应脚本的包。
- `Command` 不应出现 `<NONEXISTENT>`。
- `dev` / `preview` 根脚本中不应出现用于维护应用集合的 `--filter`。
- 根 `turbo.json` 中不应出现只属于少数应用的 `dev` / `preview` 任务定义。

示例：

```text
Tasks to Run
@tauri-vue-template/examples#dev    Command = vite
@tauri-vue-template/template#dev    Command = vite
```

顶部的 `Packages in scope` 可以显示整个 workspace 范围；判断是否正确时，以 `Tasks to Run` 为准。

## 新增应用检查清单

新增 `apps/<name>` 时，按以下清单处理：

1. 在 `apps/<name>/package.json` 中声明真实脚本：

   ```json
   {
     "scripts": {
       "dev": "vite",
       "preview": "vite preview"
     }
   }
   ```

2. 在 `apps/<name>/turbo.json` 中声明长驻任务：

   ```json
   {
     "extends": ["//"],
     "tasks": {
       "dev": {
         "cache": false,
         "persistent": true
       },
       "preview": {
         "cache": false,
         "persistent": true
       }
     }
   }
   ```

3. 如果应用有构建产物、环境变量或共享静态资源输入，在同一个包级 `turbo.json` 中补充 `build` 的 `inputs`、`env` 和 `outputs`。

4. 不修改根 `package.json` 的 `dev` / `preview`。

5. 不修改根 `turbo.json` 来新增 `dev` / `preview`。

6. 运行 dry-run 验证：

   ```bash
   pnpm dev --dry=text
   pnpm preview --dry=text
   ```

7. 确认没有 `<NONEXISTENT>` 任务。

## 内部包与 `build` 依赖

`packages/theme`、`packages/ui`、`packages/utils` 只在 workspace 内消费，应用通过 `exports` 解析到 `src/`，**dev 与应用的 build 均不依赖这些包的 `dist/`**。

| 包类型 | `dev` | `build` |
| --- | --- | --- |
| `apps/examples`、`apps/template` | 不 `dependsOn: ["^build"]` | 显式 `"dependsOn": []`，Vite 直接打包 workspace 源码 |
| 内部库 `packages/*` | 一般不声明 `dev` | 根 `turbo run build` 仍会构建 `dist/`，仅作包级校验；不是应用 dev 前置条件 |

细则见 `workspace内部包消费.md`。
