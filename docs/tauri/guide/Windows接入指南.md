# Tauri Windows 标准接入指南

本文定义本项目构建 Windows Tauri 应用的标准路径。Windows 使用现有 `src-tauri/` 工程；开发必须在 Windows 主机上进行，发布构建显式生成 NSIS 和 MSI 安装包。

标准开发命令：

```bash
pnpm windows:dev
```

标准构建命令：

```bash
pnpm windows:build
```

标准产物类型：

```text
.exe
.msi
```

## 核心原则

1. **Windows 使用现有 `src-tauri/` 桌面工程**。
   - 不生成额外 Windows 工程目录。
   - 共享 `src-tauri/src/lib.rs` 的插件、状态和 command 注册。
2. **Windows 开发在 Windows 主机执行**。
   - `tauri dev` 运行当前主机应用。
   - macOS 或 Linux 上默认不以 Windows dev 作为标准路径。
3. **Windows 构建显式指定 MSVC target 和 bundle 类型**。
   - target 固定为 `x86_64-pc-windows-msvc`。
   - bundle 固定为 `nsis,msi`。
4. **正式发布必须走 Authenticode 签名**。
   - 本地构建可用于功能验证。
   - 对外分发的安装包必须使用可信代码签名证书。

## 快速开始

1. 在 Windows 主机安装 Node.js、pnpm、Rust 和 Visual Studio Build Tools。
2. 安装 WebView2 Runtime。
3. 安装 Rust target `x86_64-pc-windows-msvc`。
4. 执行 `pnpm install`。
5. 执行 `pnpm tauri:info` 检查环境。
6. 执行 `pnpm windows:dev` 做开发验证。
7. 执行 `pnpm windows:build` 生成 NSIS `.exe` 和 MSI `.msi`。
8. 发布前配置代码签名证书。

快速验收命令：

```bash
rustup target add x86_64-pc-windows-msvc
pnpm tauri:info
pnpm windows:build
```

## 1. 标准目录

Windows 不生成额外平台工程，关键文件固定为：

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

标准构建输出位于：

```text
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/
```

## 2. 环境要求

| 项 | 标准值 |
| --- | --- |
| Host | Windows |
| Node.js | 满足 `package.json` 的 `engines` |
| 包管理器 | pnpm |
| Rust | 满足 `src-tauri/Cargo.toml` 的 `rust-version` |
| Rust target | `x86_64-pc-windows-msvc` |
| Native toolchain | Visual Studio Build Tools / MSVC C++ 工具链 |
| Runtime | Microsoft Edge WebView2 Runtime |
| 发布签名 | Authenticode 代码签名证书 |

安装 target：

```bash
rustup target add x86_64-pc-windows-msvc
```

检查环境：

```bash
pnpm tauri:info
```

## 3. package.json 标准脚本

`package.json` 中 Windows 只保留常用入口：

```json
{
  "scripts": {
    "windows:dev": "tauri dev",
    "windows:build": "tauri build --target x86_64-pc-windows-msvc --bundles nsis,msi"
  }
}
```

普通开发：

```bash
pnpm windows:dev
```

发布构建：

```bash
pnpm windows:build
```

## 4. Tauri 配置

Windows 读取基础配置：

```text
src-tauri/tauri.conf.json
```

当前项目窗口和 bundle 信息由该文件统一维护。Windows 默认字段写在 `bundle.windows` 中，不维护独立 Windows 覆盖文件；Windows 构建以基础配置和命令行 `--target`、`--bundles` 为准。

## 5. Rust 入口标准

`src-tauri/src/main.rs` 包含 Windows release 隐藏控制台窗口的标准属性：

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    app_lib::run();
}
```

这行属性只影响 Windows release 控制台窗口，不改变 macOS、Linux、Android、iOS 或 OpenHarmony 行为。

## 6. Capability 标准配置

官方空模板只包含 `core:default`。本项目因为启用了额外插件，所以按 Tauri v2 权限模型补充对应权限：跨平台插件权限放在 `src-tauri/capabilities/default.json`，桌面端插件权限放在 `src-tauri/capabilities/desktop.json`。不要把桌面端插件权限放进 Android / iOS capability。

新增 Windows 能力时必须同时满足：

1. Rust 侧注册插件或 command。
2. 前端只调用已注册能力。
3. capability 中授予对应权限。
4. 权限的 `platforms` 覆盖 `windows`。

## 7. 签名与安装包

Windows 标准发布产物：

```text
NSIS .exe installer
MSI .msi installer
```

Tauri Windows 签名入口来自 `bundle.windows`：

```json
{
  "bundle": {
    "windows": {
      "digestAlgorithm": "sha256",
      "certificateThumbprint": "CERT_SHA1_THUMBPRINT",
      "timestampUrl": "http://timestamp.digicert.com",
      "tsp": false
    }
  }
}
```

需要指定 Windows SDK `signtool.exe` 路径时使用：

```text
TAURI_WINDOWS_SIGNTOOL_PATH
```

非 Windows host 交叉签名时使用 `signCommand`，其中 `%1` 会被 Tauri 替换为待签名文件路径。真实证书和私钥必须由本机证书库或 CI secret 提供，不写入仓库。

发布验收必须满足：

```text
安装包可在干净 Windows 环境安装
安装后应用可启动
卸载入口可正常移除应用
安装包签名可被 Windows 信任
```

本地验证可以先运行：

```bash
pnpm windows:build
```

正式发布前必须接入 Authenticode 签名证书和时间戳服务。签名规则和 updater 签名边界见 `docs/tauri/guide/签名与更新签名指南.md`。

## 8. 构建流程

`pnpm windows:build` 的阶段顺序：

1. Tauri 执行 `beforeBuildCommand`。
2. `pnpm build` 完成 Vue 类型检查和 Vite 构建。
3. Cargo 使用 `x86_64-pc-windows-msvc` 构建 release binary。
4. Tauri bundler 生成 NSIS 安装包。
5. Tauri bundler 生成 MSI 安装包。
6. 如果配置签名，安装包进入代码签名阶段。

## 9. 常见问题

### 在 macOS 或 Linux 执行 `pnpm windows:dev` 失败

Windows dev 的标准路径是 Windows 主机。跨平台 dev 不是本项目标准路径。

### 找不到 MSVC linker

安装 Visual Studio Build Tools，并确保 C++ build tools、Windows SDK 和 MSVC toolchain 完整。

### WebView2 缺失

安装 Microsoft Edge WebView2 Runtime。现代 Windows 通常已内置，但干净测试机仍需要确认。

### 只生成了一个安装包

检查脚本是否包含：

```bash
--bundles nsis,msi
```

### release 启动时出现控制台窗口

确认 `src-tauri/src/main.rs` 保留：

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
```

## 10. 接入清单

- [ ] Windows 开发在 Windows 主机执行。
- [ ] 已安装 Visual Studio Build Tools。
- [ ] 已安装 WebView2 Runtime。
- [ ] 已安装 `x86_64-pc-windows-msvc`。
- [ ] `windows:dev` 为 `tauri dev`。
- [ ] `windows:build` 为 `tauri build --target x86_64-pc-windows-msvc --bundles nsis,msi`。
- [ ] 插件权限已按跨平台和桌面端分开声明。
- [ ] 本地构建能生成 `.exe` 和 `.msi`。
- [ ] 发布产物完成 Authenticode 签名。
- [ ] 已配置 `certificateThumbprint` 或 `signCommand`。
- [ ] updater artifact 如需发布，已按独立 updater 私钥完成签名。

## 11. 参考资料

- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/src/main.rs`
- `src-tauri/capabilities/default.json`
- `docs/tauri/cli/dev.md`
- `docs/tauri/cli/build.md`
- `docs/tauri/guide/签名与更新签名指南.md`
