# Tauri Linux 标准接入指南

本文定义本项目构建 Linux Tauri 应用的标准路径。Linux 使用现有 `src-tauri/` 工程；开发必须在 Linux 主机上进行，发布构建显式生成 DEB、RPM 和 AppImage。

标准开发命令：

```bash
pnpm linux:dev
```

标准构建命令：

```bash
pnpm linux:build
```

标准产物类型：

```text
.deb
.rpm
.AppImage
```

## 核心原则

1. **Linux 使用现有 `src-tauri/` 桌面工程**。
   - 不生成额外 Linux 工程目录。
   - 共享 `src-tauri/src/lib.rs` 的 Tauri Builder、插件和 commands。
2. **Linux 开发在 Linux 主机执行**。
   - `tauri dev` 运行当前 Linux 桌面 WebView。
   - macOS 或 Windows 上默认不以 Linux dev 作为标准路径。
3. **Linux 构建显式指定 target 和 bundle 类型**。
   - target 固定为 `x86_64-unknown-linux-gnu`。
   - bundle 固定为 `deb,rpm,appimage`。
4. **发布构建要控制系统兼容性**。
   - Linux 产物受 glibc、WebKitGTK、系统库和发行版基线影响。
   - CI 发布环境应固定在明确的 Linux 发行版镜像上。

## 快速开始

1. 在 Linux 主机安装 Node.js、pnpm、Rust 和系统开发依赖。
2. 安装 Rust target `x86_64-unknown-linux-gnu`。
3. 执行 `pnpm install`。
4. 执行 `pnpm tauri:info` 检查环境。
5. 执行 `pnpm linux:dev` 做开发验证。
6. 执行 `pnpm linux:build` 生成 DEB、RPM 和 AppImage。
7. 在目标发行版上安装或运行产物做验收。

快速验收命令：

```bash
rustup target add x86_64-unknown-linux-gnu
pnpm tauri:info
pnpm linux:build
```

## 1. 标准目录

Linux 不生成额外平台工程，关键文件固定为：

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
src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/
src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/rpm/
src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/
```

## 2. 环境要求

| 项 | 标准值 |
| --- | --- |
| Host | Linux |
| Node.js | 满足 `package.json` 的 `engines` |
| 包管理器 | pnpm |
| Rust | 满足 `src-tauri/Cargo.toml` 的 `rust-version` |
| Rust target | `x86_64-unknown-linux-gnu` |
| WebView | WebKitGTK |
| Bundle | DEB、RPM、AppImage |

Debian / Ubuntu 常用依赖：

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

Fedora / RHEL 系发行版依赖名称会不同，以发行版包管理器为准。

## 3. package.json 标准脚本

`package.json` 中 Linux 只保留常用入口：

```json
{
  "scripts": {
    "linux:dev": "tauri dev",
    "linux:build": "tauri build --target x86_64-unknown-linux-gnu --bundles deb,rpm,appimage"
  }
}
```

普通开发：

```bash
pnpm linux:dev
```

发布构建：

```bash
pnpm linux:build
```

## 4. Tauri 配置

Linux 读取基础配置：

```text
src-tauri/tauri.conf.json
```

当前项目没有独立 Linux 覆盖文件。Linux 默认字段写在 `bundle.linux` 中；当前 Linux 构建以基础配置和命令行 `--target`、`--bundles` 为准。

## 5. Rust 入口标准

Linux 与其他桌面平台共享 `src-tauri/src/lib.rs`：

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Linux 桌面插件通过 `#[cfg(desktop)]` 或非移动平台条件注册；不要把 Linux 专属逻辑写进前端运行时判断里。

## 6. Capability 标准配置

官方空模板只包含 `core:default`。本项目因为启用了额外插件，所以按 Tauri v2 权限模型补充对应权限：跨平台插件权限放在 `src-tauri/capabilities/default.json`，桌面端插件权限放在 `src-tauri/capabilities/desktop.json`。不要把桌面端插件权限放进 Android / iOS capability。

Linux 新增能力必须同时确认：

1. 插件在 Rust Builder 中注册。
2. capability 中有对应权限。
3. `platforms` 包含 `linux`。
4. 前端调用路径有错误提示或降级逻辑。

## 7. 发布与兼容性

Linux 发布验收必须覆盖：

```text
DEB 可安装、可卸载
RPM 可安装、可卸载
AppImage 可执行
应用菜单、图标和桌面入口正常
WebKitGTK 依赖满足目标系统要求
```

Tauri bundler 对 RPM 提供内置 PGP 签名入口：

```text
TAURI_SIGNING_RPM_KEY
TAURI_SIGNING_RPM_KEY_PASSPHRASE
```

`TAURI_SIGNING_RPM_KEY` 是 ASCII armored PGP private key。设置后 RPM 会进入 `build_and_sign`；未设置时 RPM 仍可构建，但不带 Tauri 内置 RPM 签名。DEB 和 AppImage 的仓库签名、包索引签名或外部分发签名由发行渠道处理。

建议在固定 CI 镜像中构建 Linux 产物，避免开发机系统库升级导致产物兼容性漂移。签名规则和 updater 签名边界见 `docs/tauri/guide/签名与更新签名指南.md`。

## 8. 构建流程

`pnpm linux:build` 的阶段顺序：

1. Tauri 执行 `beforeBuildCommand`。
2. `pnpm build` 完成 Vue 类型检查和 Vite 构建。
3. Cargo 使用 `x86_64-unknown-linux-gnu` 构建 release binary。
4. Tauri bundler 生成 DEB。
5. Tauri bundler 生成 RPM。
6. Tauri bundler 生成 AppImage。

## 9. 常见问题

### `webkit2gtk` 相关编译失败

Linux Tauri 依赖系统 WebKitGTK 开发包。按目标发行版安装对应 `webkit2gtk`、`xdo`、`ayatana-appindicator`、`rsvg`、`openssl` 开发依赖。

### AppImage 在旧系统无法启动

通常是 glibc 或系统库基线过高。发布构建应固定在兼容性更保守的 Linux 镜像中完成。

### 只生成了 DEB，没有 RPM 或 AppImage

检查脚本是否包含：

```bash
--bundles deb,rpm,appimage
```

### 在 macOS 或 Windows 执行 `pnpm linux:dev` 失败

Linux dev 的标准路径是 Linux 主机。跨平台 dev 不作为本项目标准路径。

## 10. 接入清单

- [ ] Linux 开发在 Linux 主机执行。
- [ ] 已安装 WebKitGTK 和 Tauri Linux 系统依赖。
- [ ] 已安装 `x86_64-unknown-linux-gnu`。
- [ ] `linux:dev` 为 `tauri dev`。
- [ ] `linux:build` 为 `tauri build --target x86_64-unknown-linux-gnu --bundles deb,rpm,appimage`。
- [ ] 插件权限已按跨平台和桌面端分开声明。
- [ ] 本地构建能生成 `.deb`、`.rpm` 和 `.AppImage`。
- [ ] 发布产物在目标发行版完成安装和启动验收。
- [ ] RPM 正式发布时通过 `TAURI_SIGNING_RPM_KEY` 完成签名。
- [ ] updater artifact 如需发布，已按独立 updater 私钥完成签名。

## 11. 参考资料

- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/capabilities/default.json`
- `docs/tauri/cli/dev.md`
- `docs/tauri/cli/build.md`
- `docs/tauri/guide/签名与更新签名指南.md`
