# Tauri Android Dev 调试指南

本文记录 Android dev 环境下调试 WebView、接口请求和登录问题的步骤。不要把 dev 调试日志截图直接外发；即使前端会脱敏，Network 面板仍可能显示真实请求体。

## 1. 适用场景

| 场景 | 说明 |
| --- | --- |
| Android 登录失败但 Web 正常 | 优先比较 Android WebView 和 Web 浏览器的实际请求 URL、Header、Body 和响应。 |
| dev 环境接口异常 | 检查 `VITE_APP_BASE_API`、`VITE_APP_API_URL`、Vite proxy、设备网络和后端响应。 |
| 原生壳问题 | 通过 Chrome DevTools inspect Android WebView，看 Console、Network 和运行时错误。 |

## 2. 前置配置

### 2.1 环境变量

Android dev 通过 Tauri 的 `beforeDevCommand` 启动 `pnpm dev`，Vite 默认按 `development` mode 读取 `.env.development`，本机私有覆盖项可放到 `.env.local` 或 `.env.development.local`。

```env
VITE_APP_PORT=3000
VITE_APP_TITLE=争逐
VITE_APP_BASE_API=/dev-api
VITE_APP_API_URL=https://aox.ai.orchiport.asia
VITE_MOCK_DEV_SERVER=false
VITE_APP_DEBUG=true
```

要求：

- `VITE_APP_PORT` 默认是 `3000`，需要和 `src-tauri/tauri.conf.json` 的 `devUrl` 端口保持一致。
- `VITE_APP_TITLE` 默认是 `争逐`，只影响页面标题或展示文案，不影响 Chrome inspect 是否能看到 WebView。
- `VITE_APP_BASE_API` 是前端请求前缀；本地 Web dev 需要走 Vite 反向代理时设置，例如 `/dev-api`。
- `VITE_APP_API_URL` 是接口地址，也是 Vite 反向代理的 `target`。
- 打包或移动端直连后端时，不设置 `VITE_APP_BASE_API`，只保留 `VITE_APP_API_URL`。
- `VITE_MOCK_DEV_SERVER` 默认是 `false`；需要本地 Mock 时显式改为 `true`。
- `VITE_APP_DEBUG=true`：打开前端 HTTP 调试日志。

生产环境不要打开 `VITE_APP_DEBUG=true`。

### 2.2 HTTP 调试日志

HTTP 调试封装在：

```text
src/api/core/debug.ts
```

开启 `VITE_APP_DEBUG=true` 后会输出：

| 日志 | 用途 |
| --- | --- |
| `[api:request]` | 请求发出前打印请求方法、接口路径、请求地址、查询参数、请求头、请求体。 |
| `[api:response]` | HTTP 成功后打印 HTTP 状态、业务码、消息、数据。 |
| `[api:error]` | HTTP 非 2xx 时打印 HTTP 状态和后端错误内容。 |

自动脱敏字段：

- `authorization`
- `password`
- `token`
- `access_token`
- `refresh_token`
- `refreshToken`

注意：Chrome Network 面板显示的是浏览器原始请求，不一定脱敏；分享前必须手动打码。

## 3. 启动 Android dev

项目命令是：

```bash
pnpm android:dev
```

这是长运行命令，只在需要真机或本地 Android 虚拟机调试时手动执行。执行后保持终端运行，不要关闭 Vite dev server。

如果修改了环境变量或 HTTP 调试代码，重新运行 Android dev，确保 Android WebView 加载新 bundle。

## 4. 用 Chrome inspect Android WebView

### 4.1 本地 Android 虚拟机/模拟器

本地虚拟机不需要 USB 线、USB 模式或手机 RSA 授权；Chrome `devices` 看不到时，先按 ADB 和 WebView 调试链路排查。

1. 先启动本地 Android 虚拟机或 Android Emulator。
2. 运行 `pnpm android:dev`，保持终端运行。
3. 等 App 在虚拟机里打开并停留在前台。
4. 电脑 Chrome 打开 `chrome://inspect/#devices`。
5. 确认 `Discover USB devices` 已勾选。
6. 找到 `emulator-xxxx` 下的当前应用 WebView。
7. 点击 `inspect`，打开 DevTools 的 Console 和 Network。
8. 在 Android App 内复现登录或接口问题。

如果 `devices` 看不到本地虚拟机：

- 先确认 ADB 能看到虚拟机：

  ```bash
  adb devices
  ```

  正常应类似：

  ```text
  emulator-5554    device
  ```

- 如果没有 `emulator-xxxx device`，说明虚拟机没有被 ADB 识别；先重启虚拟机，必要时重启 ADB：

  ```bash
  adb kill-server
  adb start-server
  adb devices
  ```

- 如果 ADB 能看到虚拟机，但 Chrome 看不到 WebView，确认 App 是通过 `pnpm android:dev` 跑起来的 debug 包，不是 release 包。
- 确认 App 已经打开到 WebView 页面；App 崩溃、卡启动或没有进入前台时，Chrome 可能没有可 inspect 的目标。
- 重启 App、Chrome 或 ADB 后，重新打开 `chrome://inspect/#devices`。
- 如果同时运行多个虚拟机，确认当前 App 安装并启动在 `adb devices` 中对应的那台虚拟机上。
- 进阶确认 WebView devtools socket 是否存在：

  ```bash
  adb shell cat /proc/net/unix | grep webview_devtools_remote
  ```

  没有输出时，通常表示 App 没有启动到可调试 WebView，或当前安装包不是可调试包。

### 4.2 真机

1. Android 设备打开开发者选项和 USB 调试。
2. 用 USB 连接电脑。
3. 电脑 Chrome 打开 `chrome://inspect/#devices`。
4. 找到当前应用 WebView。
5. 点击 `inspect`。
6. 打开 DevTools 的 Console 和 Network。
7. 在 Android App 内复现登录或接口问题。

如果看不到真机设备：

- 检查 USB 调试授权弹窗是否同意。
- 更换 USB 数据线或端口。
- 确认 Android dev 进程仍在运行。
- 重启 App 后重新打开 `chrome://inspect/#devices`。

## 5. 登录问题排查步骤

Android 登录失败但 Web 登录正常时，按下面顺序检查。

### 5.1 Console 看 `[api:request]`

登录时应出现类似日志：

```js
{
  method: 'POST',
  path: '/api/app/auth/login',
  url: 'https://api-staging.example.com/api/app/auth/login',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  },
  body: {
    username: 'alice',
    password: '<redacted>'
  }
}
```

重点确认：

| 检查项 | 正常值 |
| --- | --- |
| `method` | `POST` |
| `path` | `/api/app/auth/login` |
| `url` | 走代理时可以是 `/dev-api/api/app/auth/login`；直接请求时应是 `https://api-staging.example.com/api/app/auth/login` |
| `headers.content-type` | `application/json` |
| `headers.authorization` | 登录请求不应自动携带旧 access token |
| `body.username` | 实际输入的账号，不能为空，不能被输入法改写大小写 |
| `body.password` | 日志中显示 `<redacted>`，Network 面板可确认是否非空 |

### 5.2 Console 看 `[api:response]`

如果 HTTP status 是 200，但业务失败，会出现：

```js
{
  status: 200,
  code: 400,
  message: '参数错误',
  data: ...
}
```

这时重点看 `data` 是否包含后端校验详情，例如哪个字段缺失或格式错误。

### 5.3 Network 看原始请求

在 Network 里过滤：

```text
auth/login
```

打开请求后检查：

- Request URL
- Request Headers
- Request Payload
- Response

和 Web 正常登录请求逐项对比。真正有效的差异通常在：

- URL 不同。
- Header 不同。
- Body 字段名或值不同。
- 请求地址和当前运行方式不匹配，例如应直连后端时仍然是 `http://tauri.localhost/dev-api/...`。
- 后端返回的业务 `data` 有校验详情。

## 6. 常见原因

| 现象 | 可能原因 | 处理方式 |
| --- | --- | --- |
| Android 请求 URL 是 `http://tauri.localhost/dev-api/...` | 当前 WebView 的请求链路和 Web 浏览器的 `localhost:3000` 请求链路不一致，可能没有走到同一层代理或仍加载旧 bundle。 | 对比 Android WebView 和 Web 浏览器的 Network 请求，再确认当前 devUrl、Vite proxy 和环境变量是否一致。 |
| 登录请求带 `authorization` | App 内旧 token 持久化污染登录请求。 | 当前 HTTP 客户端已避免登录/注册/刷新自动带旧 token；仍异常时清 App 数据。 |
| `body.username` 首字母大写 | Android 输入法自动大写或纠错。 | 登录输入框已设置 `autocapitalize="none"` 和 `autocorrect="off"`。 |
| HTTP 状态 200 但业务码是参数错误 | 后端业务校验失败。 | 看 `[api:response]` 里的 `data` 或 Network Response 定位字段。 |
| Network 没有请求 | 表单未提交、按钮 disabled、JS 报错或 WebView 没加载新代码。 | 看 Console 错误，重启 App。 |
| Console 没有 `[api:request]` | `VITE_APP_DEBUG` 未开启或当前 WebView 不是最新 dev bundle。 | 设置 `VITE_APP_DEBUG=true` 后重新运行 Android dev。 |
| Chrome `devices` 看不到本地虚拟机 | 虚拟机未被 ADB 识别、App 未启动到 WebView、安装了 release 包，或 Chrome/ADB 状态卡住。 | 先确认 `adb devices` 有 `emulator-xxxx device`，再重启 App、Chrome 或 ADB；确认通过 `pnpm android:dev` 跑 debug 包。 |

## 7. 清理 Android App 数据

如果怀疑旧持久化状态影响登录，可以在 Android 系统设置中清理应用数据，或卸载重装 dev 包。

清理后重新打开 App，再复现登录。

## 8. 反馈问题时提供的信息

定位登录失败时，至少提供以下内容：

1. Console 中对应登录请求的 `[api:request]`。
2. Console 中对应登录响应的 `[api:response]` 或 `[api:error]`。
3. Network 中 `auth/login` 的 Request URL 和 Response。
4. Web 正常请求与 Android 异常请求的差异。
5. 如果是本地虚拟机调试，提供 `adb devices` 中对应的 `emulator-xxxx device` 状态；如果是 Chrome `devices` 看不到，也说明 App 是否已在虚拟机前台打开。

分享前必须打码：

- 密码
- token
- Authorization
- Cookie
- 真实用户隐私字段

## 9. 调试完成后的收尾

- 不要把 `VITE_APP_DEBUG=true` 带到生产环境。
- 不要把带真实请求体的截图提交到仓库。
- 如果新增临时日志，只保留 `src/api/core/debug.ts` 这种受环境变量控制、会脱敏的日志。
