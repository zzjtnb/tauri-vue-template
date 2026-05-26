# Tauri 依赖更新指南

本文定义本项目更新 Tauri 2 相关依赖的标准路径。核心顺序是：**先更新并确认 Rust/Cargo 后端版本，再让前端 npm 包匹配后端实际解析结果**。

官方文档：<https://v2.tauri.app/develop/updating-dependencies/>

## 最先记住：npm 包和 Cargo crate 必须同步

由于 JavaScript API 依赖后端 Rust 代码，新增功能通常需要同时升级前端 npm 包和后端 Cargo crate，确保两侧兼容。

核心同步规则：

- `@tauri-apps/api` npm 包与 `tauri` Cargo crate 必须保持相同 minor 版本。例如 Rust 侧是 `tauri 2.8.x`，JS 侧就应使用 `@tauri-apps/api 2.8.x`。
- Tauri 插件的同步要求更严格。插件可能在 patch release 中引入跨语言 API 变化，因此 npm 包和 Cargo crate 需要一起升级，并保持完全相同版本。例如 `@tauri-apps/plugin-fs 2.2.1` 必须对应 `tauri-plugin-fs 2.2.1`。

## 一句话流程

```text
先更新 Rust/Cargo 后端依赖 -> 查看后端实际版本 -> 按后端版本更新 npm 包 -> pnpm tauri:info 确认无 mismatch -> 构建验证
```

不要反过来先执行：

```bash
pnpm update @tauri-apps/cli @tauri-apps/api --latest
```

然后再为了匹配 npm latest 去改 `Cargo.toml`。这会让当前 OpenHarmony 分支项目很容易丢失正确的 Rust 依赖来源。

## 0. 先判断项目使用哪条版本线

更新前必须先确定目标版本线。当前项目默认使用 **OpenHarmony 分支版本线**。

| 版本线 | 适用场景 | `Cargo.toml` 形态 |
| --- | --- | --- |
| OpenHarmony 分支版本线 | 当前项目默认；需要保留鸿蒙接入 | `git + branch = "feat/open-harmony"` |
| Tauri 官方 crates.io 稳定线 | 明确不再使用 OpenHarmony 分支时 | `version = "..."` |

后续教程分两种情况。当前项目通常按 **情况 A** 执行。

## 情况 A：保留 OpenHarmony 分支的完整更新流程

这是当前项目的标准流程。

### A1. 保持后端核心依赖来源不变

当前项目的 Tauri 核心依赖来自 OpenHarmony 分支。`src-tauri/Cargo.toml` 应保持：

```toml
[build-dependencies]
tauri-build = { git = "https://github.com/tauri-apps/tauri", branch = "feat/open-harmony", features = [] }

[dependencies]
tauri = { git = "https://github.com/tauri-apps/tauri", branch = "feat/open-harmony", features = [] }
```

不要把它改成：

```toml
tauri = { version = "..." }
tauri-build = { version = "..." }
```

除非你明确决定切回官方 crates.io 稳定线。

### A2. 先理解 Cargo.toml 和 Cargo.lock 的分工

`Cargo.toml` 和 `Cargo.lock` 表达的是两层不同信息：

| 文件 | 作用 | 是否应该手动表达版本变化 |
| --- | --- | --- |
| `src-tauri/Cargo.toml` | 声明项目想要的依赖来源和版本约束 | 是，直接依赖、插件版本、git 分支或 rev 应在这里表达 |
| `src-tauri/Cargo.lock` | 记录 Cargo 实际解析到的具体版本、来源和 git commit | 否，通常由 Cargo 自动更新 |

因此不能只看 `Cargo.lock`。如果你想升级某个 Rust 插件，例如 `tauri-plugin-fs` 从 `2.4.4` 升到 `2.5.1`，应先改 `Cargo.toml`：

```toml
tauri-plugin-fs = "2.5.1"
```

再执行：

```bash
cargo update --manifest-path src-tauri/Cargo.toml -p tauri-plugin-fs
```

但 OpenHarmony 分支上的 Tauri 核心依赖不一样。当前 `Cargo.toml` 声明的是：

```toml
tauri = { git = "https://github.com/tauri-apps/tauri", branch = "feat/open-harmony", features = [] }
```

这个声明的含义是“使用这个 git 仓库的这个分支”，不是“使用某个 crates.io 版本号”。在这种写法下，后端核心更新通常体现为 `Cargo.lock` 中 git commit 变化；`Cargo.toml` 不一定变化。

如果你不希望 Tauri 核心只是跟随分支更新，而希望 `Cargo.toml` 明确锁到某个提交，可以把 `branch` 改成 `rev`：

```toml
tauri = { git = "https://github.com/tauri-apps/tauri", rev = "<commit hash>", features = [] }
```

但这会让项目不再自动跟随 `feat/open-harmony` 分支；以后每次更新 OpenHarmony Tauri 核心，都需要手动改 `rev`。当前项目默认保留 `branch` 写法，由 `Cargo.lock` 锁定实际 commit。

### A3. 先更新 Rust/Cargo 后端依赖

后端先行分两类：

1. Tauri 核心 crate：`tauri`、`tauri-build`、`tauri-runtime`、`tauri-utils` 等来自 OpenHarmony 分支。
2. Tauri 插件 crate：`tauri-plugin-fs`、`tauri-plugin-upload` 等来自 crates.io。

#### A3.1 更新 OpenHarmony 分支上的 Tauri 核心 crate

如果要拉取 OpenHarmony 分支上的较新提交，先更新 `src-tauri/Cargo.toml` 里直接声明的 Tauri git 依赖：

```bash
cargo update --manifest-path src-tauri/Cargo.toml \
  -p tauri \
  -p tauri-build
```

如果输出类似：

```text
Locking 0 packages to latest compatible versions
note: pass `--verbose` to see ... unchanged dependencies behind latest
```

表示 Cargo 已经检查过当前分支和 registry，在现有 `Cargo.toml` 约束下没有可更新的兼容包。此时不要继续执行内部 crate 的显式更新命令，直接进入 A4，查看实际版本并同步 npm 包。

`tauri-runtime`、`tauri-utils`、`tauri-macros`、`tauri-runtime-wry` 这类内部 crate 通常由 Tauri git 依赖和 `[patch.crates-io]` 间接解析，不优先裸写进更新命令。

下面这类显式内部 crate 更新命令**不是常规下一步**。只有在你明确要定位某个内部 crate、并且知道 `Cargo.lock` 中对应版本和来源时才使用。使用时必须写 `name@version`，避免 Cargo 在同名多版本包之间产生歧义：

```bash
cargo update --manifest-path src-tauri/Cargo.toml \
  -p tauri@<当前 Cargo.lock 中的 tauri 版本> \
  -p tauri-build@<当前 Cargo.lock 中的 tauri-build 版本> \
  -p tauri-runtime@<当前 Cargo.lock 中的 tauri-runtime 版本> \
  -p tauri-utils@<当前 Cargo.lock 中 git 来源的 tauri-utils 版本> \
  -p tauri-macros@<当前 Cargo.lock 中的 tauri-macros 版本> \
  -p tauri-runtime-wry@<当前 Cargo.lock 中的 tauri-runtime-wry 版本>
```

当前项目出现过的典型歧义是：`Cargo.lock` 中同时存在 `tauri-utils 2.7.0` 和 `tauri-utils 2.9.2`。如果要更新 OpenHarmony 分支上的 git 来源包，应指定 git 来源的当前版本，例如：

```bash
cargo update --manifest-path src-tauri/Cargo.toml \
  -p tauri@2.8.5 \
  -p tauri-build@2.4.1 \
  -p tauri-runtime@2.8.0 \
  -p tauri-utils@2.7.0 \
  -p tauri-macros@2.4.0 \
  -p tauri-runtime-wry@2.8.1
```

不要在这个场景下盲目选择 `tauri-utils@2.9.2`；它是 crates.io registry 来源的另一个同名版本，不一定是当前 OpenHarmony 分支要更新的那个包。

执行后以 `src-tauri/Cargo.lock` 和 `pnpm tauri:info` 的实际结果为准。如果 Cargo 提示没有可更新内容，说明当前锁文件已经在该分支当前可解析版本上，或者上游分支没有提供新的兼容提交。常规流程下，这不是失败，下一步是 A4。

#### A3.2 更新 Rust 插件 crate

插件 crate 先在 Rust 侧更新，再让 npm 插件包匹配。

例如要更新文件系统插件，先修改 `src-tauri/Cargo.toml` 中的 Rust 插件版本：

```toml
tauri-plugin-fs = "2.5.1"
```

然后更新对应 Cargo 锁文件：

```bash
cargo update --manifest-path src-tauri/Cargo.toml -p tauri-plugin-fs
```

多个插件可以分别更新：

```bash
cargo update --manifest-path src-tauri/Cargo.toml \
  -p tauri-plugin-fs \
  -p tauri-plugin-upload \
  -p tauri-plugin-updater \
  -p tauri-plugin-opener
```

注意：插件要求 npm 包和 Rust crate **完全相同版本**。所以每更新一个 `tauri-plugin-*`，后面都要同步对应的 `@tauri-apps/plugin-*`。

### A4. 查看后端实际版本

后端更新后，先查看实际解析结果：

```bash
pnpm tauri:info
```

重点看两块：

```text
Packages:
  tauri
  tauri-build
  tauri-cli
  @tauri-apps/api
  @tauri-apps/cli

Plugins:
  tauri-plugin-*
  @tauri-apps/plugin-*
```

这里的 Rust 侧版本才是前端 npm 包要匹配的依据。

### A5. 按后端版本更新前端 npm 包

根据 `pnpm tauri:info` 的 Rust 侧结果更新 npm 包。

同步规则：

```text
@tauri-apps/api        跟 tauri crate 保持同 minor
@tauri-apps/plugin-*   跟 tauri-plugin-* crate 保持 exact version
@tauri-apps/cli        使用当前工程兼容的 CLI 版本
```

示例 1：如果后端是：

```text
tauri 2.8.5
```

前端应使用同 minor 的 API 包：

```bash
pnpm add -E @tauri-apps/api@2.8.0
```

示例 2：如果后端插件是：

```text
tauri-plugin-fs 2.4.4
```

前端插件必须完全一致：

```bash
pnpm add -E @tauri-apps/plugin-fs@2.4.4
```

示例 3：当前 `package.json` 使用的 CLI 版本是：

```text
@tauri-apps/cli 2.11.2
```

则 npm CLI 使用：

```bash
pnpm add -D -E @tauri-apps/cli@2.11.2
```

如果某个插件只有 Rust 侧注册，前端没有导入对应 `@tauri-apps/plugin-*`，可以不安装 npm 插件包；但一旦前端导入，就必须 exact version 对齐。

### A6. 安装并确认没有版本 mismatch

```bash
pnpm install
pnpm tauri:info
```

也可以执行项目封装的交互式依赖工具：

```bash
pnpm tauri:deps
```

该命令会打开上下键选择菜单，适合本地手动维护依赖。菜单包含：

- 检查 Tauri 依赖同步：只检查 npm 包和 Cargo crate 是否同步，不自动修改依赖。
- 更新 OpenHarmony 核心并同步 npm：按本文档的 OpenHarmony 分支版本线执行“后端先行、前端同步”的更新流程。
- 更新单个 Tauri 插件：输入插件名和目标版本，让 `tauri-plugin-*` 与已安装的 `@tauri-apps/plugin-*` 保持 exact version。

其中检查项会确认：

- `src-tauri/Cargo.toml` 是否仍保持 OpenHarmony `feat/open-harmony` 分支版本线。
- `Cargo.toml` 与 `Cargo.lock` 是否一致。
- `pnpm tauri:info` 是否仍报告 version mismatch。
- `@tauri-apps/api` 是否与 `tauri` 保持同 minor。
- 已安装的 `@tauri-apps/plugin-*` 是否与对应 `tauri-plugin-*` 保持 exact version。

更新 OpenHarmony 核心菜单项会执行：

1. 确认 `tauri` / `tauri-build` 仍来自 OpenHarmony `feat/open-harmony` 分支。
2. 执行 `cargo update --manifest-path src-tauri/Cargo.toml -p tauri -p tauri-build`。
3. 按 `Cargo.lock` 的实际解析结果同步 npm 包。
4. 执行 `pnpm install` 和依赖同步检查。

更新单个插件菜单项会先询问插件名和目标版本，例如 `fs` / `2.5.1`，然后更新 `src-tauri/Cargo.toml` 中的 `tauri-plugin-fs`，再更新 `Cargo.lock`，最后把已安装的 `@tauri-apps/plugin-fs` 同步到完全相同的版本。

如果 `pnpm tauri:info` 仍然报：

```text
Found version mismatched Tauri packages
```

不要使用 `--ignore-version-mismatches` 作为正式解决方案。应继续按报错列出的包名修正版本。

`outdated, latest: ...` 不是错误。保留 OpenHarmony 分支时，latest 只是提示 npm 或 crates.io 有更新，不代表当前项目必须直接升到 latest。

### A7. 构建验证

基础验证：

```bash
pnpm build
pnpm rust:check
pnpm tauri:build
```

移动端按目标平台补充验证：

```bash
pnpm android:build
pnpm ios:build
pnpm harmony:build
```

iOS、OpenHarmony 需要对应 SDK、签名和构建环境完整。无法验证时必须记录原因。

### A8. 误执行 npm latest 后如何修复

如果误执行了：

```bash
pnpm update @tauri-apps/cli @tauri-apps/api --latest
```

然后出现类似错误：

```text
tauri (v2.8.5) : @tauri-apps/api (v2.11.0)
```

修复方式不是把 `Cargo.toml` 的 OpenHarmony `git` 依赖改成 crates.io latest，而是让 npm 包回到后端兼容版本线。

例如后端仍是：

```text
tauri 2.8.5
tauri-cli <当前工程兼容版本>
```

则执行：

```bash
pnpm add -E @tauri-apps/api@2.8.0
pnpm add -D -E @tauri-apps/cli@<当前工程兼容版本>
pnpm tauri:info
```

直到 `pnpm tauri:info` 不再报告 version mismatch。

## 情况 B：切回 Tauri 官方 crates.io 稳定线的完整更新流程

只有明确决定不再使用 OpenHarmony `feat/open-harmony` 分支时，才走本流程。

### B1. 先做版本线决策

切回 crates.io 稳定线意味着需要同轮处理：

- `src-tauri/Cargo.toml` 的 `tauri` / `tauri-build` 来源。
- `[patch.crates-io]` 中 Tauri 相关 patch。
- `package.json` 的 `@tauri-apps/*` 包。
- `src-tauri/Cargo.lock` 和 `pnpm-lock.yaml`。
- Android、iOS、OpenHarmony 生成工程是否还兼容。

如果还要保留 OpenHarmony，就不要走本流程。

### B2. 先更新 Rust/Cargo 后端

把 `src-tauri/Cargo.toml` 的核心依赖从 `git + branch` 改为 crates.io 版本写法。

这里的 `version = "..."` 有明确含义：

- `version` 表示从 crates.io registry 解析这个 crate，而不是从 OpenHarmony `git + branch` 解析。
- 文档里的 `<tauri version>`、`<tauri-build version>` 是占位符，不能原样写进 `Cargo.toml`。
- 实际填写时必须替换成具体版本号，例如 `2.11.2`、`2.6.2`。
- Cargo 中 `version = "2.11.2"` 默认是语义化版本范围要求，不是绝对锁死；实际解析结果由 `Cargo.lock` 锁定。
- 如果必须精确锁死某个 crate 版本，可以写 `version = "=2.11.2"`，但普通应用项目通常依赖 `Cargo.lock` 保证可复现，不需要默认使用 `=`。

示例里的 `<...>` 都是说明性占位符：

```toml
[build-dependencies]
tauri-build = { version = "<tauri-build version>", features = [] }

[dependencies]
tauri = { version = "<tauri version>", features = [] }
```

实际写法示例：

```toml
[build-dependencies]
tauri-build = { version = "2.6.2", features = [] }

[dependencies]
tauri = { version = "2.11.2", features = [] }
```

注意：`tauri-build` 和 `tauri` 是两个不同 crate，版本号不一定完全相同；以 crates.io 当前实际版本为准。

同时更新 Rust 插件 crate：

```toml
tauri-plugin-fs = "<version>"
tauri-plugin-upload = "<version>"
tauri-plugin-updater = "<version>"
```

然后更新 Cargo 锁文件：

```bash
cargo update --manifest-path src-tauri/Cargo.toml
```

如需使用 `cargo-edit`，可以使用：

```bash
cargo install cargo-edit
cargo upgrade --manifest-path src-tauri/Cargo.toml
```

### B3. 查看后端实际版本

```bash
pnpm tauri:info
```

记录实际解析到的：

```text
tauri
tauri-plugin-*
tauri-cli
```

### B4. 再更新前端 npm 包

```bash
pnpm add -E @tauri-apps/api@<与 tauri crate 同 minor 的版本>
pnpm add -D -E @tauri-apps/cli@<与当前工程兼容的版本>
pnpm add -E @tauri-apps/plugin-fs@<与 tauri-plugin-fs 完全一致的版本>
```

其它插件按同样规则处理。

### B5. 验证

```bash
pnpm install
pnpm tauri:info
pnpm build
pnpm rust:check
pnpm tauri:build
```

如果要继续支持移动端，再验证：

```bash
pnpm android:build
pnpm ios:build
```

如果仍保留 OpenHarmony 目标，也必须重新验证：

```bash
pnpm harmony:build
```

## 版本不一致报错处理

典型报错会列出 npm 包和 Rust crate 的版本差异。处理时按报错逐项修正，不要先绕过。

处理规则：

```text
@tauri-apps/api          -> tauri                保持同 minor
@tauri-apps/plugin-xxx   -> tauri-plugin-xxx     保持 exact version
```

示例：

```text
tauri-plugin-fs 2.4.4 -> @tauri-apps/plugin-fs 2.4.4
tauri 2.8.5           -> @tauri-apps/api 2.8.x
```

修正后重新安装并验证：

```bash
pnpm install
pnpm tauri:info
```

## 禁止事项

- 不要把 `--ignore-version-mismatches` 写进标准脚本。
- 不要为了匹配 npm latest，误删 OpenHarmony `git + branch` 依赖。
- 不要只更新 `package.json`，不更新或不确认 `src-tauri/Cargo.lock`。
- 不要只更新 Rust 插件 crate，却忘记同步对应 `@tauri-apps/plugin-*`。
- 不要把 `outdated, latest: ...` 当成必须立即升级到 latest 的错误。

## 接入清单

- [ ] 已确认目标版本线：OpenHarmony 分支或 Tauri 官方 crates.io 稳定线。
- [ ] 已先更新或确认 Rust/Cargo 后端版本。
- [ ] 如保留 OpenHarmony 分支，`tauri` / `tauri-build` 仍使用 `git + branch = "feat/open-harmony"`。
- [ ] `@tauri-apps/api` 与 `tauri` crate 保持同 minor。
- [ ] 每个已安装的 `@tauri-apps/plugin-*` 与对应 `tauri-plugin-*` 保持 exact version。
- [ ] `@tauri-apps/cli` 与当前工程兼容。
- [ ] `package.json`、`pnpm-lock.yaml`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock` 表达同一套版本线。
- [ ] 标准脚本没有新增 `--ignore-version-mismatches`。
- [ ] `pnpm tauri:info` 不再报告 version mismatch。
- [ ] `pnpm build` 通过。
- [ ] `pnpm rust:check` 通过。
- [ ] 目标平台构建通过，或已明确记录未验证原因。

## 参考资料

- Tauri 官方依赖更新文档：<https://v2.tauri.app/develop/updating-dependencies/>
- `package.json`
- `pnpm-lock.yaml`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `docs/tauri/guide/鸿蒙接入指南.md`
