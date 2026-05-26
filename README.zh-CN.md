# tauri-vue-template

[English](./README.md)

这个仓库用于维护 Tauri 2 + Vue 3 模板的不同版本线。

`main` 分支只作为仓库入口和分支导航，不直接放置完整模板源码。请选择下面的模板分支使用：

| 分支 | 说明 | 适用场景 |
| --- | --- | --- |
| `standalone` | 单应用版 Tauri + Vue 模板 | 普通桌面 / 移动端应用起步，结构简单直接 |
| `turborepo` | Turborepo / monorepo 版模板 | 多应用、多包共享、团队工程化扩展 |

## 使用方式

克隆单应用模板：

```bash
git clone -b standalone https://github.com/zzjtnb/tauri-vue-template.git
```

克隆 Turborepo 模板：

```bash
git clone -b turborepo https://github.com/zzjtnb/tauri-vue-template.git
```

如果某个分支还不存在，说明对应模板版本尚未发布。

## 分支约定

- `main`：仓库入口、分支导航和通用说明。
- `standalone`：单应用模板主线。
- `turborepo`：Turborepo 模板主线。

## 许可证

[MIT](./LICENSE)
