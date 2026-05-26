# @/utils/http

一个基于原生 `fetch` 的通用 HTTP 客户端。它以 `HttpClient` class 为核心，不依赖任何第三方请求库，也不绑定具体业务响应结构。

## 特性

- 原生 `fetch` 实现，无额外运行时依赖。
- `HttpClient` class 封装，可创建多个独立实例。
- 支持请求、响应、错误拦截器。
- 错误拦截器提供安全 `retry()`，同一个原始请求只允许重试一次，避免无限循环。
- 支持默认配置与单次请求配置合并。
- 支持 `baseURL`、`params`、`headers`、`credentials`、`cache`、`mode`、`redirect`、`referrerPolicy`。
- 支持普通对象/数组自动 JSON 序列化。
- 支持 `FormData`、`Blob`、`ArrayBuffer`、`URLSearchParams`、`ReadableStream`、`string` 原样作为请求体。
- 支持超时取消与外部 `AbortSignal` 取消。
- 支持 `json`、`text`、`blob`、`arrayBuffer`、`formData`、`stream`、`response` 响应解析。
- HTTP 非 2xx 状态会抛出 `HttpError`，错误中包含 `status`、`url`、`method`、`data`、`response`、`config`。
- 可显式开启完整调试日志，输出最终请求配置、响应数据与错误对象。

## 文件结构

```txt
src/utils/http/
├── index.ts        # 统一导出入口
├── request.ts      # HttpClient、默认实例、请求执行流
├── error.ts        # HttpError 错误类
├── interceptors.ts # 拦截器管理器
├── utils.ts        # URL、Header、取消、解析等无状态工具函数
├── types.ts        # 公共类型
├── debug.ts        # 调试日志实现
└── README.md       # 使用说明
```

## 快速开始

```ts
import { HttpClient } from '@/utils/http'

interface User {
  id: number
  name: string
}

const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10_000,
})

const user = await client.get<User>('/users/1')
```

## 默认实例

如果不需要自定义配置，可以使用默认实例：

```ts
import { http, request } from '@/utils/http'

const list = await http.get('/api/users')
const data = await request({ url: '/api/users', method: 'GET' })
```

## 创建实例

```ts
import { HttpClient } from '@/utils/http'

export const apiClient = new HttpClient({
  baseURL: '/api',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
  credentials: 'include',
})
```

## 请求方法

```ts
client.request({ url: '/users', method: 'GET' })
client.get('/users')
client.post('/users', { name: 'Alice' })
client.put('/users/1', { name: 'Bob' })
client.patch('/users/1', { name: 'Carol' })
client.delete('/users/1')
client.head('/users/1')
client.options('/users')
```

## 请求拦截器

请求拦截器在 `fetch` 执行前运行，按注册顺序依次处理配置。返回新的 config 会覆盖后续请求配置；不返回值表示沿用当前 config。

```ts
const requestInterceptorId = client.interceptors.request.use((config) => {
  const headers = new Headers(config.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return {
    ...config,
    headers,
  }
})

client.interceptors.request.eject(requestInterceptorId)
```

## 响应拦截器

响应拦截器只处理 HTTP 2xx 的成功结果。返回新的 result 会覆盖后续响应；不返回值表示沿用当前 result。

```ts
client.interceptors.response.use((result) => {
  console.log(result.response.status)
  return result
})
```

## 错误拦截器与安全重试

错误拦截器会处理以下错误：

- 请求拦截器抛出的错误。
- 网络错误或请求取消。
- HTTP 非 2xx 状态产生的 `HttpError`。
- 响应拦截器抛出的错误。

`context.retry()` 用于恢复错误。库内部会记录当前原始请求是否已经重试过；第二次调用 `retry()` 会直接抛错，防止无限循环。

```ts
import { HttpError } from '@/utils/http'

client.interceptors.error.use(async (error, context) => {
  if (error instanceof HttpError && error.status === 401 && !context.retried) {
    const nextToken = await refreshToken()

    return context.retry({
      headers: {
        Authorization: `Bearer ${nextToken}`,
      },
    })
  }
})
```

如果错误拦截器返回 `HttpResult`，外层请求会转为成功；如果不返回或继续抛错，错误会继续向外抛出。

## 查询参数

数组会输出为重复 key：

```ts
await client.get('/users', {
  params: {
    keyword: 'alice',
    roles: ['admin', 'editor'],
    enabled: true,
  },
})

// /users?keyword=alice&roles=admin&roles=editor&enabled=true
```

## 请求体

普通对象和数组会自动 JSON 序列化：

```ts
await client.post('/users', {
  name: 'Alice',
})
```

`FormData` 等原生请求体会保持原样：

```ts
const formData = new FormData()
formData.append('file', file)

await client.post('/upload', formData)
```

## 响应类型

默认按 JSON 解析：

```ts
const data = await client.get('/users')
```

下载 Blob：

```ts
const file = await client.get<Blob>('/export', {
  responseType: 'blob',
})
```

保留原始 `Response`：

```ts
const response = await client.get<Response>('/health', {
  responseType: 'response',
})
```

读取完整结果：

```ts
const result = await client.requestResult<User[]>({
  url: '/users',
})

console.log(result.response.status)
console.log(result.response.headers.get('x-request-id'))
console.log(result.data)
```

## 超时与取消

```ts
await client.get('/slow-api', {
  timeout: 5_000,
})
```

```ts
const controller = new AbortController()

const task = client.get('/users', {
  signal: controller.signal,
})

controller.abort()
await task
```

## 错误处理

HTTP 非 2xx 状态会抛出 `HttpError`：

```ts
import { HttpError } from '@/utils/http'

try {
  await client.get('/missing')
}
catch (error) {
  if (error instanceof HttpError) {
    console.log(error.status)
    console.log(error.method)
    console.log(error.url)
    console.log(error.data)
  }
}
```

## 调试日志

调试需要显式开启。开启后会完整输出 headers、body、requestInit、响应数据和错误对象，不做字段过滤：

```ts
const client = new HttpClient({
  baseURL: '/api',
  debug: true,
})
```

仅建议在本地开发或受控联调环境开启完整调试日志。

## 业务响应处理

本库不内置任何业务响应协议。比如后端返回 `{ code, data, message }` 时，应由业务 API 层自行处理：

```ts
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

async function getUser(id: number) {
  const response = await client.get<ApiResponse<User>>(`/users/${id}`)

  if (response.code !== 0) {
    throw new Error(response.message)
  }

  return response.data
}
```
