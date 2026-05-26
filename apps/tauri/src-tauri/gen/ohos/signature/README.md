# OpenHarmony 签名材料目录

这个目录用于放置 OpenHarmony / HarmonyOS HAP 构建签名材料，但公开模板仓库不提交真实签名材料。

不要把以下文件提交到公开模板仓库：

- `.p12`
- `.p7b`
- `.pem`
- `.cer`
- `.key`
- `.keystore`
- `.jks`
- Hvigor 加密 material
- release profile
- 任何证书、私钥或密码文件

本地开发、测试安装或正式发布时，请使用 DevEco Studio / Hvigor 生成签名材料，并按需放回本目录。相关流程见：

- `apps/tauri/docs/guide/鸿蒙接入指南.md`
- `apps/tauri/docs/guide/签名与更新签名指南.md`

公开模板只保留这个说明文件，用于说明目录用途和敏感材料边界。
