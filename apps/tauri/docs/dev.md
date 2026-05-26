# Tauri 官方 CLI 重建 `src-tauri`

目标：删除或移走 `src-tauri/` 后，尽量只用官方 Tauri CLI 重新生成项目。完整参数以 `apps/tauri/docs/cli/` 为准，本文只保留本项目重建顺序。

**方式 A**：在 `apps/tauri` 内执行下列 `pnpm tauri …`。**方式 B**：仓库根执行 `pnpm --dir apps/tauri tauri …`。规则与 Android / iOS / 鸿蒙一致，见 `apps/tauri/README.md`。

## 已验证依据

- 已按 `apps/tauri/docs/cli/{init,add,build,dev,icon,permission,capability}.md` 核对参数。
- 已在 `/tmp` 临时目录实测初始化参数：会生成 `src-tauri/`、`capabilities/default.json`，但 `identifier` 仍是默认 `com.tauri.dev`。
- 未在当前仓库执行完整 `tauri build/dev`；构建和启动命令需要按需确认后再跑。

## 1. 初始化

```bash
pnpm tauri init --force --ci \
  --app-name "示例" \
  --window-title "示例" \
  --frontend-dist "../../examples/dist" \
  --dev-url "http://localhost:3000" \
  --before-dev-command "pnpm --dir ../.. --filter @tauri-vue-template/examples dev" \
  --before-build-command "pnpm --dir ../.. --filter @tauri-vue-template/examples build"
```

`--force` 用于确认覆盖已有 `src-tauri/`；如果已经手动删除或移走该目录，它不是必需项，但重建文档里保留它更贴近覆盖重建场景。

当前 `tauri init -h` 没有 `identifier` 参数，所以脚手架会保留默认 `com.tauri.dev`。初始化后必须把 `src-tauri/tauri.conf.json` 的 `identifier` 改成项目正式值：

```json
"identifier": "com.zzjtnb.examples"
```

这是固定项目配置，不要在每次 `tauri dev/build` 时用 `--config` 临时覆盖。

## 2. 添加插件

```bash
pnpm tauri add opener
pnpm tauri add fs
pnpm tauri add os
pnpm tauri add upload
pnpm tauri add autostart
pnpm tauri add updater
pnpm tauri add window-state
```

`tauri add` 会安装前端/Rust 依赖、注册插件，并可能自动把默认 permission 加到对应 capability。不要在它之前手写 `Cargo.toml` 或 capability。

`fs`、`upload` 在前端原生能力示例中有真实入口；`autostart`、`updater`、`window-state` 是桌面能力。如果 `Cargo.toml` 按 target 隔离这些依赖，Rust 侧插件注册也必须使用一致的 target 条件，避免 Android/iOS 编译时引用不存在的 crate。

## 3. 补回项目 Rust 逻辑

当前 Rust 侧保留 `opened_urls` command 和 `RunEvent::Opened` 事件处理，作为文件打开/URL 打开场景的后端示例；默认前端应用不主动消费该事件。需要启用文件关联时，再在对应业务模块中调用 command 或监听 `opened` 事件。具体 Rust 分层、文件映射和不生成空架子的规则见 `apps/tauri/docs/guide/structure.md`。

## 4. 首次构建生成 permission 元数据

权限查询依赖构建后生成的插件 permission 元数据。添加插件后先跑一次不出安装包的构建：

```bash
pnpm tauri build --debug --no-bundle --config '{"build":{"beforeBuildCommand":"true"}}'
```

如果跳过这一步，`permission add` 可能报：

```text
permission file not found, please build your application once first
```

这里的 `build.beforeBuildCommand = "true"` 只用于首次生成 permission 元数据，避免触发默认前端应用构建；正式打包不要跳过前端构建。

如果不覆盖 `beforeBuildCommand`，这一步会先执行示例应用的前端构建命令，前端类型检查或 Vite 构建失败会导致 Tauri 构建提前退出。

如果 `identifier` 仍是 `com.tauri.dev`，构建会报：

```text
The default value `com.tauri.dev` is not allowed
```

## 5. 添加权限

`tauri add` 已经自动写入这些默认权限，不要重复添加：

- `default`：`core:default`、`opener:default`、`fs:default`、`os:default`、`upload:default`
- `desktop-capability`（文件：`capabilities/desktop.json`）：`autostart:default`、`updater:default`、`window-state:default`

结合前端原生能力示例，只需要追加项目代码额外调用的权限：

```bash
pnpm tauri permission add core:event:default default
pnpm tauri permission add core:window:allow-close default
pnpm tauri permission add core:window:allow-minimize default
pnpm tauri permission add core:window:allow-toggle-maximize default
pnpm tauri permission add core:window:allow-start-dragging default
pnpm tauri permission add opener:allow-open-path default
pnpm tauri permission add fs:allow-appdata-write-recursive default
pnpm tauri permission add fs:allow-download-meta-recursive default
pnpm tauri permission add fs:allow-document-meta-recursive default
pnpm tauri permission add fs:allow-picture-meta-recursive default
```

`permission add` 只能添加 permission identifier，不能设置 `allow.path`、`allow.url` 或 capability `platforms`。

## 6. 生成移动端工程

删除或重建 `src-tauri/` 后，如果项目还需要 Android/iOS，必须重新执行移动端初始化；否则不会生成这些目录：

```text
src-tauri/gen/android
src-tauri/gen/apple
```

执行：

```bash
pnpm tauri android init
pnpm tauri ios init
```

这一步生成移动端原生工程，不要依赖备份目录手工复制。

## 7. 生成图标

按当前项目脚本从共享 logo 生成 Tauri 图标：

```bash
pnpm tauri icon ../../packages/assets/public/logo.png
```

## 8. 运行和构建

```bash
pnpm tauri dev
pnpm tauri build
```

移动端开发和构建：

```bash
pnpm tauri android dev
pnpm tauri android build --apk --target aarch64 --ci
pnpm tauri android build --aab --target aarch64 --ci
pnpm tauri ios dev
pnpm tauri ios build --ci
```

`dev` 会启动长运行进程；`build` 会执行当前配置中的示例应用前端构建命令。

## CLI 不能完全覆盖的配置

| 配置 | 现状 |
| --- | --- |
| `identifier` | `tauri init` 没有参数；初始化后必须把生成的配置改成项目正式 identifier。 |
| 精确 URL/path scope | `permission add` 不能设置 `allow.url` / `allow.path`。 |
| capability 平台限制 | `capability new` 没有 `--platforms` 参数。 |
| updater endpoint/pubkey | `tauri add updater` 只加插件；发布参数仍是项目配置。 |
| OpenHarmony 分支版本线 | JS 侧 Tauri 包保持官方 npm 最新稳定版本；Rust 侧 OpenHarmony 依赖跟随 `feat/open-harmony` 分支。`tauri info` 的 minor mismatch 不通过降级 JS 依赖解决。 |
| 多窗口、fileAssociations | 当前 CLI 重建流程没有专门命令生成这些项目细节。 |
