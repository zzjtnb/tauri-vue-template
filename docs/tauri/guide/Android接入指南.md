# Tauri Android 标准接入指南

本文定义本项目构建 Android Tauri 应用的标准路径。Android 使用现有 `src-tauri/` 工程，并由 Tauri 官方 Android CLI 生成和维护 `src-tauri/gen/android/`。

标准初始化命令：

```bash
pnpm android:init
```

标准开发命令：

```bash
pnpm android:dev
```

标准构建命令：

```bash
pnpm android:build
```

标准产物类型：

```text
.apk
.aab
```

## 核心原则

1. **Android 使用 `src-tauri/gen/android/` 作为唯一原生工程目录**。
   - 原生工程由 `tauri android init` 生成。
   - 不手写平行 Android 工程。
2. **Android 命令使用 Tauri 官方 `android` 子命令**。
   - 初始化、开发、构建、运行分别使用 `android:init`、`android:dev`、`android:build`、`android:run`。
   - 低频参数通过 `pnpm tauri android ...` 直接透传。
3. **移动端 dev server 使用 `TAURI_DEV_HOST` 协调主机地址**。
   - 真机调试时 `localhost` 不能代表电脑。
   - Vite 根据 `TAURI_DEV_HOST` 暴露 host 和 HMR。
4. **Android 专属 Tauri 配置写在主配置中**。
   - 当前项目不维护独立 `tauri.android.conf.json`。
   - Android 默认字段集中在 `src-tauri/tauri.conf.json` 的 `bundle.android`。

## 快速开始

1. 安装 Android Studio、Android SDK、NDK 和 JDK。
2. 安装 Rust Android targets。
3. 执行 `pnpm install`。
4. 执行 `pnpm android:init` 生成 `src-tauri/gen/android/`。
5. 执行 `pnpm android:dev` 连接模拟器或真机开发。
6. 执行 `pnpm android:build` 生成 APK / AAB。
7. 发布前配置 Android release keystore 和签名流程。

快速验收命令：

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
pnpm android:init
pnpm android:build
```

## 1. 标准目录

Android 工程固定生成在：

```text
src-tauri/gen/android/
```

关键文件分布：

```text
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── capabilities/default.json
├── src/lib.rs
└── gen/android/
    ├── app/build.gradle.kts
    ├── build.gradle.kts
    ├── gradle.properties
    ├── settings.gradle
    └── app/src/main/
```

典型构建输出：

```text
src-tauri/gen/android/app/build/outputs/apk/
src-tauri/gen/android/app/build/outputs/bundle/
```

## 2. 环境要求

| 项 | 标准值 |
| --- | --- |
| Android IDE | Android Studio |
| Android SDK | 与 Tauri 生成模板一致 |
| `ANDROID_HOME` | Android SDK 根目录，例如 `$HOME/Library/Android/sdk` |
| `ANDROID_SDK_ROOT` | 与 `ANDROID_HOME` 保持一致 |
| `NDK_HOME` | 具体 NDK 版本目录，例如 `$ANDROID_HOME/ndk/29.0.14206865` |
| compileSdk | 官方模板当前为 `36` |
| targetSdk | 官方模板当前为 `36` |
| 包管理器 | pnpm |
| Rust Android targets | `aarch64`、`armv7`、`i686`、`x86_64` 对应 targets |
| Dev network | 电脑和设备在可互通网络内 |

安装 targets：

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

检查环境：

```bash
echo "$ANDROID_HOME"
echo "$ANDROID_SDK_ROOT"
echo "$NDK_HOME"
test -d "$NDK_HOME"
pnpm tauri android -h
pnpm tauri android build -h
```

## 3. package.json 标准脚本

`package.json` 暴露以下 Android 脚本：

```json
{
  "scripts": {
    "android:init": "tauri android init",
    "android:dev": "tauri android dev",
    "android:build": "tauri android build",
    "android:run": "tauri android run"
  }
}
```

首次生成 Android 工程：

```bash
pnpm android:init
```

开发调试：

```bash
pnpm android:dev
```

构建安装包：

```bash
pnpm android:build
```

## 4. Tauri 配置

基础配置：

```text
src-tauri/tauri.conf.json
```

当前项目不维护独立 Android 覆盖文件；Android 默认字段直接写在 `bundle.android` 中：

```json
{
  "bundle": {
    "android": {
      "minSdkVersion": 24,
      "versionCode": 1000
    }
  }
}
```

当前模板只声明当前 Tauri schema 明确支持的 Android 字段。需要继续添加 Android 专用字段时，必须先确认当前 Tauri CLI / `tauri-build` schema 支持该字段；不支持的字段会在移动端构建阶段直接失败。

## 5. Vite dev server 标准配置

Android dev 会读取 `build.devUrl`，并在需要时通过 `TAURI_DEV_HOST` 替换 host。当前项目 Vite 端口固定为：

```text
3000
```

HMR 端口固定为：

```text
1421
```

标准行为：

```ts
const host = process.env.TAURI_DEV_HOST

server: {
  port: 3000,
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

Tauri WebView 负责展示页面，Vite 不应通过 `server.open` 额外打开浏览器窗口。

## 6. Rust 入口标准

Android 是移动平台，`src-tauri/src/lib.rs` 必须保留：

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

插件注册必须按平台隔离。当前项目把桌面专属插件排除在 Android 之外，把可用插件放在非 OHOS 平台分组中注册。

## 7. Capability 标准配置

Android 使用 `src-tauri/capabilities/default.json`。该文件 `platforms` 必须包含：

```json
"android"
```

官方模板最小权限为 `core:default`。本项目额外权限来自实际插件使用，例如文件系统、系统信息、上传和 opener。新增 Android 能力时必须同时检查插件注册、前端调用和 capability 权限。

## 8. 签名与发布

Android 本地 debug 构建可使用调试签名。Tauri 官方 Android 模板不默认生成 release `signingConfigs`；正式发布必须使用 release keystore，并在 Gradle / Android Studio / CI 发布链路中完成签名。

标准 secret 来源：

```text
ANDROID_KEYSTORE_PATH
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

推荐 Gradle 结构：

```kotlin
val releaseKeystore = System.getenv("ANDROID_KEYSTORE_PATH")

android {
    signingConfigs {
        create("release") {
            storeFile = releaseKeystore?.let { file(it) }
            storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias = System.getenv("ANDROID_KEY_ALIAS")
            keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
        }
    }
    buildTypes {
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

发布验收必须满足：

```text
APK 可在测试设备安装
AAB 可用于应用商店上传链路
应用启动后能访问前端资源
需要的 Tauri 插件权限在运行时可用
release 产物使用正式 keystore 签名
```

签名规则和 updater 签名边界见 `docs/tauri/guide/签名与更新签名指南.md`。

## 9. 构建流程

`pnpm android:build` 的阶段顺序：

1. Tauri 执行 `beforeBuildCommand`。
2. `pnpm build` 完成 Vue 类型检查和 Vite 构建。
3. Tauri 调用 Android Gradle 工程。
4. Rust 编译 Android ABI 对应 native library。
5. Gradle 打包 APK / AAB。
6. release 发布链路进入签名阶段。

## 10. 常见问题

### 真机白屏或无法连接 dev server

确认电脑和手机网络互通，并使用：

```bash
pnpm tauri android dev --host
```

如果指定 IP：

```bash
pnpm tauri android dev --host <电脑局域网 IP>
```

### HMR 不生效

确认防火墙允许设备访问电脑的 `3000` 和 `1421` 端口。

### `debugApplicationIdSuffix` schema 报错

当前模板只在 `src-tauri/tauri.conf.json` 的 `bundle.android` 中保留 `minSdkVersion` 和 `versionCode` 这类当前 schema 支持的字段。如果添加 `debugApplicationIdSuffix` 后出现 schema 报错，说明当前 Tauri CLI / `tauri-build` 版本不支持该字段；应先删除该字段，或升级到明确支持该字段的 Tauri 版本线后再使用。

### 缺少 Android Rust target

安装完整 Android targets：

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

## 11. 接入清单

- [ ] `src-tauri/gen/android/` 由 `pnpm android:init` 生成。
- [ ] `src-tauri/tauri.conf.json` 的 `bundle.android` 存放 Android 默认配置。
- [ ] Vite dev server 不设置 `server.open`。
- [ ] Vite 使用 `TAURI_DEV_HOST` 处理真机 host。
- [ ] `android:init` 为 `tauri android init`。
- [ ] `android:dev`、`android:build`、`android:run` 透传官方 CLI。
- [ ] 已安装 Android Rust targets。
- [ ] APK / AAB 构建和安装验收通过。
- [ ] release 产物使用正式 keystore 签名。
- [ ] keystore 和密码只通过本机环境或 CI secret 注入。
- [ ] updater artifact 如需发布，已按独立 updater 私钥完成签名。

## 12. 参考资料

- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/capabilities/default.json`
- `docs/tauri/cli/android.md`
- `docs/tauri/guide/签名与更新签名指南.md`
