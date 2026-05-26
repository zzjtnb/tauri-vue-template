# Tauri iOS 标准接入指南

本文定义本项目构建 iOS Tauri 应用的标准路径。iOS 使用现有 `src-tauri/` 工程，并由 Tauri 官方 iOS CLI 生成和维护 `src-tauri/gen/apple/`。

## 命令怎么写

脚本在 `apps/tauri/package.json`。任选一种方式，**与 Android / 鸿蒙相同**：

| | 写法 |
| --- | --- |
| **方式 A**（在 `apps/tauri` 内） | `cd apps/tauri` 后执行 `pnpm ios:build` |
| **方式 B**（在仓库根） | `pnpm --dir apps/tauri ios:build` |

下文步骤若只写 `pnpm ios:*`，默认指**方式 A**；在根目录请改成方式 B。

标准初始化命令：

```bash
# 方式 A
cd apps/tauri && pnpm ios:init

# 方式 B（仓库根）
pnpm --dir apps/tauri ios:init
```

标准开发命令：

```bash
pnpm ios:dev              # 方式 A
pnpm --dir apps/tauri ios:dev       # 方式 B
```

标准构建命令：

```bash
pnpm ios:build            # 方式 A
pnpm --dir apps/tauri ios:build     # 方式 B
```

标准产物类型：

```text
.app
.xcarchive
.ipa
```

## 核心原则

1. **iOS 使用 `src-tauri/gen/apple/` 作为唯一 Apple 移动工程目录**。
   - iOS 工程由 `tauri ios init` 生成。
   - 不手写平行 Xcode 工程。
2. **iOS 命令只能在 macOS host 上执行**。
   - iOS dev、build、run 依赖 Xcode。
   - Linux 和 Windows 不是本项目 iOS 标准构建环境。
3. **移动端 dev server 使用 `TAURI_DEV_HOST` 协调主机地址**。
   - 模拟器可使用本机地址。
   - 真机必须使用电脑在局域网中的可访问地址。
4. **签名和导出方式由 Xcode / Tauri iOS 配置统一管理**。
   - 本地模拟器验证可以跳过签名。
   - 真机和 TestFlight / App Store Connect 必须使用 Apple 证书和 provisioning profile。

## 快速开始

1. 在 macOS 主机安装 Node.js、pnpm、Rust 和完整 Xcode。
2. 安装 iOS Rust targets。
3. 执行 `pnpm install`。
4. 执行 `pnpm ios:init` 生成 `src-tauri/gen/apple/`。
5. 执行 `pnpm ios:dev` 使用模拟器或真机开发。
6. 执行 `pnpm ios:build` 生成 iOS release 产物。
7. 发布前配置 Apple Team、证书、profile 和 export method。

快速验收命令：

```bash
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
pnpm ios:init
pnpm ios:build
```

## 1. 标准目录

iOS 工程固定生成在：

```text
src-tauri/gen/apple/
```

关键文件分布：

```text
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── capabilities/default.json
├── src/lib.rs
└── gen/apple/
    ├── ExportOptions.plist
    ├── LaunchScreen.storyboard
    ├── Podfile
    ├── project.yml
    └── Sources/
```

iOS 专属覆盖配置在需要时使用：

```text
src-tauri/tauri.conf.json 的 `bundle.iOS`
```

当前项目不维护独立 iOS 覆盖文件；iOS 最低系统版本、bundle version 和外部注入的 Apple Team 边界写在 `src-tauri/tauri.conf.json` 的 `bundle.iOS` 中。

## 2. 环境要求

| 项 | 标准值 |
| --- | --- |
| Host | macOS |
| Xcode | 完整 Xcode，不是仅 Command Line Tools |
| Node.js | 满足 `package.json` 的 `engines` |
| 包管理器 | pnpm |
| Rust | 满足 `src-tauri/Cargo.toml` 的 `rust-version` |
| Rust targets | `aarch64-apple-ios`、`aarch64-apple-ios-sim`、`x86_64-apple-ios` |
| 发布签名 | Apple Developer Team、证书、provisioning profile |

安装 targets：

```bash
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
```

检查命令：

```bash
pnpm tauri ios -h
pnpm tauri ios build -h
```

## 3. package.json 标准脚本

`package.json` 暴露以下 iOS 脚本：

```json
{
  "scripts": {
    "ios:init": "tauri ios init",
    "ios:dev": "tauri ios dev",
    "ios:build": "tauri ios build",
    "ios:run": "tauri ios run"
  }
}
```

首次生成 iOS 工程：

```bash
pnpm ios:init
```

开发调试：

```bash
pnpm ios:dev
```

构建 iOS 产物：

```bash
pnpm ios:build
```

## 4. Tauri 配置

基础配置：

```text
src-tauri/tauri.conf.json
```

iOS 配置入口固定为：

```text
src-tauri/tauri.conf.json 的 `bundle.iOS`
```

当前项目已配置：

```json
{
  "bundle": {
    "iOS": {
      "minimumSystemVersion": "14.0",
      "bundleVersion": "1",
      "developmentTeam": null
    }
  }
}
```

标准原则：基础配置维护跨平台公共信息，`bundle.iOS` 只维护 Apple 平台差异。模板不硬编码个人 Apple Team；真机构建、TestFlight 或 App Store Connect 发布时，通过 `APPLE_DEVELOPMENT_TEAM` 或本地私有覆盖配置提供 Team。

## 5. Vite dev server 标准配置

iOS dev 会读取 `build.devUrl`，真机会通过 `TAURI_DEV_HOST` 替换 host。

默认 `src-tauri/tauri.conf.json` 指向 **examples**（Vite 默认 **3000**）；**template** 目标为 **3001**。可通过 `VITE_APP_PORT` 覆盖。移动端 HMR 端口为 **1421**。

标准行为（以 examples 为例）：

```ts
const host = process.env.TAURI_DEV_HOST

server: {
  port: +(env.VITE_APP_PORT || 3000),
  strictPort: true,
  host: host || true,
  hmr: host
    ? {
        protocol: 'ws',
        host,
        port: 1421,
      }
    : undefined,
}
```

`tauri:target -- dev --target template` 时，dev server 须在 **3001** 监听。

Tauri iOS WebView 负责显示页面，Vite 不应通过 `server.open` 额外打开浏览器。

## 6. Rust 入口标准

iOS 是移动平台，`src-tauri/src/lib.rs` 必须保留：

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

`src-tauri/src/main.rs` 仍作为桌面入口存在；iOS 使用 `mobile_entry_point`。

## 7. Capability 标准配置

iOS 使用 `src-tauri/capabilities/default.json`。该文件 `platforms` 必须包含：

```json
"iOS"
```

官方模板最小权限为 `core:default`。本项目额外权限来自实际插件使用。新增 iOS 能力时必须确认插件在 iOS 可用；桌面专属插件必须通过 Rust cfg 排除。

## 8. Xcode 工程与签名

`pnpm ios:init` 会生成 Xcode 相关文件。官方模板中的 `project.yml` 会根据 Tauri 配置生成 bundle identifier、deployment target、Info.plist、entitlements 和 Rust build script。

iOS 签名入口分为 Tauri 配置、Xcode project 同步和环境变量三层。Tauri 配置字段：

```json
{
  "bundle": {
    "iOS": {
      "developmentTeam": "TEAMID",
      "bundleVersion": "1",
      "minimumSystemVersion": "14.0"
    }
  }
}
```

`developmentTeam` 也可以通过环境变量覆盖：

```text
APPLE_DEVELOPMENT_TEAM
```

CI 可用证书、profile 和 App Store Connect 环境变量：

```text
IOS_CERTIFICATE
IOS_CERTIFICATE_PASSWORD
IOS_MOBILE_PROVISION
APPLE_API_KEY
APPLE_API_ISSUER
APPLE_API_KEY_PATH
```

发布链路需要明确：

```text
Apple Team
Bundle Identifier
证书
Provisioning Profile
Export Method
Build Number
```

如果 Xcode 报：

```text
Signing for "app_iOS" requires a development team.
Select a development team in the Signing & Capabilities editor.
```

说明 `app_iOS` target 缺少 `DEVELOPMENT_TEAM`，不是 Rust 编译失败，也不是前端构建失败。当前生成工程中通常已经有：

```text
CODE_SIGN_IDENTITY = "iPhone Developer"
PRODUCT_BUNDLE_IDENTIFIER = com.zzjtnb.examples
```

但如果没有 `DEVELOPMENT_TEAM`，Xcode 仍然不知道使用哪个 Apple Developer Team 签名。

处理方式：

1. 通过 Tauri iOS build 的 `-o, --open` 选项打开 Xcode：

   ```bash
   pnpm tauri ios build -o
   ```

   也可以直接打开 `src-tauri/gen/apple/app.xcodeproj`。
2. 选择 target `app_iOS`。
3. 进入 `Signing & Capabilities`。
4. 选择 Apple Developer Team，并确认 bundle identifier 没有被占用。
5. 或在 Tauri iOS 配置中固定 `developmentTeam`，再重新生成/同步 Apple 工程。

注意：`--export-method` 只决定 archive 导出方式，例如 `debugging`、`release-testing`、`app-store-connect`；它不能替代 `DEVELOPMENT_TEAM`。

常用构建变体：

```bash
pnpm tauri ios build -t aarch64-sim --no-sign
pnpm tauri ios build -t aarch64 --export-method release-testing --ci
pnpm tauri ios build -t aarch64 --export-method app-store-connect --ci
```

`ios:build` 保持官方默认入口；特定导出方式通过 `pnpm tauri ios build ...` 显式传参。签名规则和 updater 签名边界见 `apps/tauri/docs/guide/签名与更新签名指南.md`。

## 9. 构建流程

`pnpm ios:build` 的阶段顺序：

1. Tauri 执行 `beforeBuildCommand`。
2. Tauri 按配置执行示例应用的前端构建命令。
3. Tauri 调用 iOS/Xcode 工程。
4. Rust 编译 iOS target 对应 static library。
5. Xcode 生成 app/archive。
6. 根据签名和 export method 生成 IPA。

## 10. 常见问题

### 在非 macOS 环境执行 iOS 命令失败

iOS 命令只在 macOS host 上可用。标准构建环境必须安装完整 Xcode。

### 真机无法访问 dev server

使用：

```bash
pnpm tauri ios dev --host
```

或指定局域网地址：

```bash
pnpm tauri ios dev --host <电脑局域网 IP>
```

并确认防火墙允许访问 `3000` 和 `1421`。

### 签名失败：requires a development team

典型错误：

```text
Signing for "app_iOS" requires a development team.
Select a development team in the Signing & Capabilities editor.
```

根因是 iOS target 没有 `DEVELOPMENT_TEAM`。确认 `developmentTeam` 或 `APPLE_DEVELOPMENT_TEAM` 已设置，并确认证书、provisioning profile 和 bundle identifier 一致。

优先用 Tauri CLI 打开对应 Xcode 工程并配置签名：

```bash
pnpm tauri ios build -o
```

`--export-method` 不能修复这个问题；它只控制导出 IPA 的方式，不负责选择 Apple Developer Team。

模拟器验证可使用：

```bash
pnpm tauri ios build -t aarch64-sim --no-sign
```

### 修改了 Tauri 配置但 Xcode 工程未更新

重新执行：

```bash
pnpm ios:init
```

必要时使用官方 iOS init 的 `--reinstall-deps` 参数。

## 11. 接入清单

- [ ] iOS 开发和构建在 macOS 主机执行。
- [ ] 已安装完整 Xcode。
- [ ] 已安装 iOS Rust targets。
- [ ] `src-tauri/gen/apple/` 由 `pnpm ios:init` 生成。
- [ ] Vite dev server 不设置 `server.open`。
- [ ] 真机调试使用 `--host` 或 `TAURI_DEV_HOST`。
- [ ] `ios:init` 为 `tauri ios init`。
- [ ] `ios:dev`、`ios:build`、`ios:run` 透传官方 CLI。
- [ ] 发布前配置 Apple 签名、profile 和 export method。
- [ ] 真机构建设置 `developmentTeam` 或 `APPLE_DEVELOPMENT_TEAM`。
- [ ] CI 签名材料通过 `IOS_CERTIFICATE`、`IOS_CERTIFICATE_PASSWORD`、`IOS_MOBILE_PROVISION` 注入。
- [ ] updater artifact 如需发布，已按独立 updater 私钥完成签名。

## 12. 参考资料

- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/capabilities/default.json`
- `apps/tauri/docs/cli/ios.md`
- `apps/tauri/docs/guide/签名与更新签名指南.md`
