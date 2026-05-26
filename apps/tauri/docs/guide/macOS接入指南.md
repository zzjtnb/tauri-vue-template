# Tauri macOS 标准接入指南

本文定义本项目构建 macOS Tauri 应用的标准路径。macOS 使用现有 `src-tauri/` 工程，不创建额外原生工程目录；开发、构建、签名和产物验收均围绕本项目当前唯一发布产物 `.dmg` 维护。

标准开发命令：

```bash
pnpm mac:dev
```

标准构建命令：

```bash
pnpm mac:build
```

标准发布产物类型：

```text
.dmg
```

## 核心原则

1. **macOS 使用现有 `src-tauri/` 桌面工程**。
   - Rust 入口保持 `src-tauri/src/main.rs` 薄入口。
   - 应用逻辑保持在 `src-tauri/src/lib.rs`。
2. **开发命令不默认携带跨平台 target**。
   - `tauri dev` 在当前 macOS 主机运行本机开发应用。
   - 指定 target 只用于明确排查特定 Rust target。
3. **发布构建显式生成 macOS bundle**。
   - macOS release 使用 `universal-apple-darwin`。
   - bundle 类型固定为 `dmg`。
4. **签名和公证属于发布门槛**。
   - 本地验证可以生成未签名产物。
   - 分发给用户的 `.dmg` 必须完成 Developer ID 签名和 notarization。

## 快速开始

1. 在 macOS 主机安装 Node.js、pnpm、Rust 和 Xcode Command Line Tools。
2. 安装 macOS universal 构建所需 Rust target。
3. 执行 `pnpm install`。
4. 执行 `pnpm tauri:info` 查看 Tauri 环境。
5. 执行 `pnpm mac:dev` 做开发验证。
6. 执行 `pnpm mac:build` 生成 `.dmg`。
7. 发布前配置 Apple 证书、公证账号和签名参数。

快速验收命令：

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
pnpm tauri:info
pnpm mac:build
```

## 1. 标准目录

macOS 不生成额外平台工程，关键文件固定为：

```text
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── capabilities/
│   ├── default.json
│   └── desktop.json
└── src/
    ├── main.rs
    └── lib.rs
```

标准发布构建输出位于：

```text
src-tauri/target/universal-apple-darwin/release/bundle/dmg/
```

## 2. 环境要求

| 项 | 标准值 |
| --- | --- |
| Host | macOS |
| Node.js | 满足 `package.json` 的 `engines` |
| 包管理器 | pnpm |
| Rust | 满足 `src-tauri/Cargo.toml` 的 `rust-version` |
| Rust targets | `aarch64-apple-darwin`、`x86_64-apple-darwin` |
| Apple 工具链 | Xcode Command Line Tools |
| 发布签名 | Apple Developer Program、Developer ID Application 证书 |

安装 target：

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

检查环境：

```bash
pnpm tauri:info
```

## 3. package.json 标准脚本

`package.json` 中 macOS 只保留常用入口：

```json
{
  "scripts": {
    "mac:dev": "tauri dev",
    "mac:build": "tauri build --target universal-apple-darwin --bundles dmg"
  }
}
```

普通开发：

```bash
pnpm mac:dev
```

发布构建：

```bash
pnpm mac:build
```

## 4. Tauri 配置

macOS 读取基础配置：

```text
src-tauri/tauri.conf.json
```

当前项目默认配置指向“示例”应用，关键配置为：

```json
{
  "productName": "示例",
  "identifier": "com.zzjtnb.examples",
  "build": {
    "frontendDist": "../../examples/dist",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "pnpm --dir ../.. --filter @tauri-vue-template/examples dev",
    "beforeBuildCommand": "pnpm --dir ../.. --filter @tauri-vue-template/examples build"
  },
  "bundle": {
    "active": true,
    "targets": ["dmg", "nsis", "deb"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

macOS 构建脚本通过 `--bundles dmg` 明确收敛当前平台发布产物。

## 5. Rust 入口标准

`src-tauri/src/main.rs` 只做桌面入口转发：

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    app_lib::run();
}
```

`src-tauri/src/lib.rs` 是跨桌面、移动和 OpenHarmony 的统一应用入口：

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

本项目在 `lib.rs` 中注册插件、状态和 commands；macOS 共享这套入口。

## 6. Capability 标准配置

官方模板的最小权限是：

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": ["core:default"]
}
```

官方空模板只包含 `core:default`。本项目因为启用了额外插件，所以按 Tauri v2 权限模型补充对应权限：跨平台插件权限放在 `src-tauri/capabilities/default.json`，桌面端插件权限放在 `src-tauri/capabilities/desktop.json`。不要把桌面端插件权限放进 Android / iOS capability。macOS 新能力必须先确认插件注册和 capability 权限成对出现。

## 7. 签名与公证

macOS 发布链路分三层：

1. 构建 `.dmg` 发布产物。
2. 使用 Developer ID Application 证书签名。
3. 提交 Apple notarization 并完成 stapling。

Tauri macOS 签名入口来自 `bundle.macOS`：

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Example Company (TEAMID)",
      "hardenedRuntime": true,
      "providerShortName": "TEAMID",
      "entitlements": "Entitlements.plist"
    }
  }
}
```

CI 或无人值守发布使用环境变量注入证书和 notarization 凭据：

```text
APPLE_CERTIFICATE
APPLE_CERTIFICATE_PASSWORD
APPLE_ID
APPLE_PASSWORD
APPLE_TEAM_ID
APPLE_API_KEY
APPLE_API_ISSUER
APPLE_API_KEY_PATH
```

本地验证可以使用：

```bash
pnpm mac:build
```

正式发布验收必须满足：

```text
.dmg 可被 macOS Gatekeeper 接受
.dmg 打开后应用可正常拖入 Applications
spctl 校验通过
```

常用人工验收命令：

```bash
spctl --assess --type open --verbose path/to/示例.dmg
```

签名规则和 updater 签名边界见 `apps/tauri/docs/guide/签名与更新签名指南.md`。

## 8. 构建流程

`pnpm mac:build` 的阶段顺序：

1. Tauri 执行 `beforeBuildCommand`。
2. Tauri 按配置执行示例应用的前端构建命令。
3. Cargo 构建 `universal-apple-darwin`。
4. Tauri bundler 生成 `.dmg`。
5. 如果配置了签名和公证，进入签名、公证和 staple 阶段。

## 9. 常见问题

### `universal-apple-darwin` 构建失败

原因通常是缺少某个架构 target。按标准安装：

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

### `.dmg` 没生成

检查脚本是否仍是普通 `tauri build`。macOS 标准脚本必须包含：

```bash
--bundles dmg
```

### 打开的应用提示来自未知开发者

这是签名或公证问题，不是前端构建问题。发布产物必须完成 Developer ID 签名和 notarization。

### `pnpm mac:dev` 打开了浏览器窗口

标准 Vite 配置不使用 `server.open`。Tauri dev 会自己创建 WebView，前端 dev server 不应额外打开浏览器。

## 10. 接入清单

- [ ] `src-tauri/src/main.rs` 保持薄入口。
- [ ] `src-tauri/src/lib.rs` 使用统一 `run()`。
- [ ] `mac:dev` 为 `tauri dev`。
- [ ] `mac:build` 为 `tauri build --target universal-apple-darwin --bundles dmg`。
- [ ] 已安装 `aarch64-apple-darwin` 和 `x86_64-apple-darwin`。
- [ ] 本地构建能生成 `.dmg`。
- [ ] 插件权限已按跨平台和桌面端分开声明。
- [ ] 发布产物完成签名、公证和 staple。
- [ ] updater artifact 如需发布，已按独立 updater 私钥完成签名。

## 11. 参考资料

- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/capabilities/default.json`
- `apps/tauri/docs/cli/dev.md`
- `apps/tauri/docs/cli/build.md`
- `apps/tauri/docs/guide/签名与更新签名指南.md`
