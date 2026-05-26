# Tauri 打包器应用

`apps/tauri` 是当前 workspace 的 Tauri 原生工程包。`android:*`、`ios:*`、`harmony:*`、`mac:*`、`tauri:*` 等脚本都定义在本目录 `package.json`；**根 `package.json` 没有这些脚本**。

## 两种执行方式（Android / iOS / 鸿蒙 / 桌面规则相同）

**方式 A — 先进入本包目录**（平台接入文档里的步骤列表默认用这种简写）：

```bash
cd apps/tauri
pnpm android:build
pnpm ios:build
pnpm harmony:build
```

**方式 B — 在仓库根目录**（不必 `cd`，与方式 A 等价）：

```bash
pnpm --dir apps/tauri android:build
pnpm --dir apps/tauri ios:build
pnpm --dir apps/tauri harmony:build
```

也可用 workspace 包名（同样等价）：

```bash
pnpm --filter @tauri-vue-template/tauri android:build
```

下文表格里的「实际命令」列在 `apps/tauri` 内执行时，把 `<script>` 换成 `pnpm <script>` 即可；在仓库根则写成 `pnpm --dir apps/tauri <script>`。

## 当前默认 Tauri 配置

没有传 `--config` 的 Tauri CLI 命令会读取 `src-tauri/tauri.conf.json`。本包当前默认配置指向“示例”应用。

| 配置项 | 当前值 | 说明 |
| --- | --- | --- |
| 配置文件 | `src-tauri/tauri.conf.json` | Tauri 官方默认配置文件。 |
| `productName` | `示例` | 桌面窗口、移动端工程和安装包中使用的应用名称来源。 |
| `identifier` | `com.zzjtnb.examples` | 桌面 bundle id、移动端 application id / bundle id 的基础值。 |
| `version` | `0.1.0` | Tauri 应用版本。 |
| `build.devUrl` | `http://localhost:3000` | `tauri:dev` 和平台 dev 别名调试时使用的前端地址。 |
| `build.frontendDist` | `../../examples/dist` | `tauri:build` 和平台 build 别名打包时读取的前端产物目录。 |
| `build.beforeDevCommand` | `pnpm --dir ../.. --filter @tauri-vue-template/examples dev` | Tauri dev 启动前执行的示例前端 dev server 命令。 |
| `build.beforeBuildCommand` | `pnpm --dir ../.. --filter @tauri-vue-template/examples build` | Tauri build 前执行的示例前端构建命令。 |
| `bundle.targets` | `dmg`、`nsis`、`deb` | 本包默认桌面分发格式：macOS DMG、Windows NSIS EXE、Linux DEB。 |

因此，直接运行 `tauri:dev`、`tauri:build`、`mac:build`、`windows:build`、`linux:build` 等本包脚本时，构建目标都是这个默认“示例”应用。

## 基础脚本

| 脚本 | 实际命令 | 用途 | 主要输出 |
| --- | --- | --- | --- |
| `build` | `pnpm rust:check` | 本包默认构建检查入口。 | Rust 编译检查结果，不产生安装包。 |
| `type-check` | `pnpm rust:check` | 与 workspace 类型检查任务对齐。 | Rust 编译检查结果。 |
| `rust:fmt` | `cargo fmt --manifest-path src-tauri/Cargo.toml` | 格式化 Rust 代码。 | 修改 Rust 源码格式。 |
| `rust:check` | `cargo check --manifest-path src-tauri/Cargo.toml` | 检查 Rust 编译。 | 终端诊断信息。 |
| `rust:clippy` | `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` | 运行 Rust Clippy，并把 warning 当作错误。 | 终端诊断信息。 |
| `rust:test` | `cargo test --manifest-path src-tauri/Cargo.toml` | 运行 Rust 测试。 | 测试结果。 |
| `lint:rust` | `pnpm rust:fmt && pnpm rust:clippy` | Rust 格式化和 lint。 | 可能修改格式；Clippy 必须无 warning。 |

## Tauri 通用脚本

| 脚本 | 实际命令 | 用途 | 主要输出 |
| --- | --- | --- | --- |
| `tauri` | `tauri` | 透传 Tauri CLI。 | 取决于继续传入的 Tauri 子命令。 |
| `tauri:init` | `tauri init` | 初始化或更新 Tauri 工程骨架。 | `src-tauri/**` 基础工程文件。已有工程通常不重复执行。 |
| `tauri:info` | `tauri info` | 查看 Tauri、Rust、Node、平台依赖信息。 | 终端诊断信息。 |
| `tauri:icon` | `tauri icon ../../packages/assets/public/logo.png` | 从共享 logo 生成 Tauri 图标资源。 | 默认写入 `src-tauri/icons/`，例如 `32x32.png`、`128x128.png`、`128x128@2x.png`、`icon.icns`、`icon.ico`。 |
| `tauri:signer` | `tauri signer` | 调用 Tauri signer 子命令。 | signer 按传入子命令生成 key 或 `.sig` 等签名相关文件。 |
| `tauri:dev` | `tauri dev` | 使用默认配置调试桌面示例应用。 | 本地桌面调试进程，并按配置启动示例前端 dev server。 |
| `tauri:build` | `tauri build` | 使用默认配置构建当前宿主平台。 | `src-tauri/target/**/release/bundle/**` 下的当前平台 bundle。 |

签名相关密码只能通过环境变量或 Tauri 官方交互流程提供，不要写进脚本、配置、文档示例或日志。

## 桌面平台脚本

| 脚本 | 实际命令 | 用途 | 推荐发布产物 |
| --- | --- | --- | --- |
| `mac:dev` | `tauri dev` | macOS 桌面调试别名，等同于 `tauri:dev`。 | 不产生发布产物。 |
| `mac:build` | `tauri build --target universal-apple-darwin --bundles dmg` | 构建 macOS universal DMG。 | `src-tauri/target/universal-apple-darwin/release/bundle/dmg/**.dmg`。 |
| `windows:dev` | `tauri dev` | Windows 桌面调试别名，等同于 `tauri:dev`。 | 不产生发布产物。 |
| `windows:build` | `tauri build --target x86_64-pc-windows-msvc --bundles nsis` | 构建 Windows NSIS 安装包。 | `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/**.exe`。 |
| `linux:dev` | `tauri dev` | Linux 桌面调试别名，等同于 `tauri:dev`。 | 不产生发布产物。 |
| `linux:build` | `tauri build --target x86_64-unknown-linux-gnu --bundles deb` | 构建 Linux Debian 包。 | `src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/**.deb`。 |

当前本包桌面发布只保留 DMG、NSIS EXE 和 DEB。`.app`、`.msi`、`.rpm`、`.AppImage` 不属于本包脚本的默认发布目标。

## 移动端和 OpenHarmony 脚本

| 脚本 | 实际命令 | 用途 | 主要输出 |
| --- | --- | --- | --- |
| `android:init` | `tauri android init` | 初始化 Android 生成工程。 | `src-tauri/gen/android/**`。 |
| `android:dev` | `tauri android dev` | Android 设备或模拟器调试。 | 本地调试安装和运行结果。 |
| `android:build` | `tauri android build` | 构建 Android 包。 | `src-tauri/gen/android/app/build/outputs/apk/**.apk`、`src-tauri/gen/android/app/build/outputs/bundle/**.aab`。 |
| `android:run` | `tauri android run` | 构建并运行 Android 应用。 | 设备安装和运行结果，可能复用 Android build 输出。 |
| `ios:init` | `tauri ios init` | 初始化 iOS 生成工程。 | `src-tauri/gen/apple/**`。 |
| `ios:dev` | `tauri ios dev` | iOS 模拟器或真机调试。 | Xcode 调试构建结果。 |
| `ios:build` | `tauri ios build` | 构建 iOS 应用。 | `src-tauri/gen/apple/build/**`，最终发布产物取决于 Xcode archive/export 流程。 |
| `ios:run` | `tauri ios run` | 构建并运行 iOS 应用。 | 模拟器或真机安装运行结果。 |
| `harmony` | `cargo tauri ohos` | 透传 OpenHarmony Tauri 子命令入口。 | 取决于继续传入的 `cargo tauri ohos` 子命令。 |
| `harmony:init` | `cargo tauri ohos init` | 初始化 OpenHarmony 生成工程。 | `src-tauri/gen/ohos/**`。 |
| `harmony:dev` | `cargo tauri ohos dev` | OpenHarmony 调试运行。 | 本地调试构建和设备运行结果。 |
| `harmony:build` | `cargo tauri ohos build --debug --target aarch64` | 构建 OpenHarmony aarch64 debug 包。 | `src-tauri/gen/ohos/**` 下由 OpenHarmony 工具链生成的 `.hap`、`.app` 或相关构建产物。 |

移动端和 OpenHarmony 生成工程都位于 `src-tauri/gen/**`。重新 init 或切换包名、应用名、签名配置后，应确认生成工程里的应用名称、包名和签名设置与 `src-tauri/tauri.conf.json` 保持一致。

## 生产产物选择

| 平台 | 本包推荐分发物 | 原始产物位置 | 说明 |
| --- | --- | --- | --- |
| macOS | `.dmg` | `src-tauri/target/universal-apple-darwin/release/bundle/dmg/` | 对外分发使用 DMG；签名和公证按 macOS 发布要求处理。 |
| Windows | `.exe` | `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/` | 本包默认只构建 NSIS EXE；正式发布应确认代码签名。 |
| Linux | `.deb` | `src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/` | 本包默认只构建 Debian/Ubuntu 系 DEB。 |
| Android | `.aab` / `.apk` | `src-tauri/gen/android/app/build/outputs/` | 商店分发优先 AAB；测试和侧载可使用 APK。 |
| iOS | Xcode archive/export 结果 | `src-tauri/gen/apple/build/` | App Store 发布依赖 Apple 证书、profile、archive/export 和 App Store Connect 流程。 |
| OpenHarmony | `.app` / `.hap` | `src-tauri/gen/ohos/` | 具体包格式和签名要求以 OpenHarmony 工具链输出和上架规范为准。 |

直接运行本包脚本时，产物保留在 Tauri 或移动端工具链默认输出目录，不会自动搬运到其它归档目录。
