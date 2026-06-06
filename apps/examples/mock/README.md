# Mock API 示例

## 目录结构

```text
apps/examples/mock/
├── base.ts                    # Mock 路径配置，挂载到 /api/examples/
└── examples/
    ├── status.ts              # GET /api/examples/status - 状态信息
    ├── components.ts          # GET /api/examples/components - 组件分类
    └── themes.ts              # GET /api/examples/themes - 主题配置
```

## 启用 Mock 服务

在 `.env.development` 中设置：

```env
VITE_MOCK_DEV_SERVER=true
VITE_APP_BASE_API=/dev-api
```

## Mock 接口列表

### 1. 状态信息

**请求:**

```http
GET /dev-api/api/examples/status
```

**响应:**

```json
{
  "name": "Tauri Vue Examples",
  "version": "0.1.0",
  "message": "示例 Mock 服务运行正常",
  "features": [
    "shadcn-vue 组件",
    "布局系统",
    "Logo 编辑器",
    "字体系统",
    "主题配色",
    "虚拟信用卡"
  ],
  "updatedAt": "2026-06-05T02:36:00.000Z"
}
```

### 2. 组件分类

**请求:**

```http
GET /dev-api/api/examples/components
```

**响应:**

```json
{
  "categories": [
    {
      "id": "basic",
      "name": "基础组件",
      "components": ["Button", "Input", "Select", "Checkbox", "Radio"]
    },
    {
      "id": "layout",
      "name": "布局组件",
      "components": ["TopNav", "Sidebar", "Hybrid", "Blank"]
    }
  ],
  "total": 18
}
```

### 3. 主题配置

**请求:**

```http
GET /dev-api/api/examples/themes
```

**响应:**

```json
{
  "themes": [
    {
      "id": "light",
      "name": "浅色主题",
      "primary": "#3b82f6",
      "background": "#ffffff",
      "foreground": "#000000"
    }
  ],
  "current": "system"
}
```

## 使用示例

### 在组件中调用

```vue
<script setup lang="ts">
import { ref } from 'vue'

const data = ref(null)

async function fetchData() {
  const baseUrl = import.meta.env.VITE_APP_BASE_API || '/dev-api'
  const response = await fetch(`${baseUrl}/api/examples/status`)
  data.value = await response.json()
}
</script>
```

### 查看演示页面

访问 `/mock-demo` 查看完整的 Mock API 调用示例。

## 添加新的 Mock 接口

1. 在 `apps/examples/mock/examples/` 创建新文件
2. 从 `../base` 导入 `defineMock`
3. 定义接口路径和响应

```typescript
import { defineMock } from '../base'

export default defineMock({
  url: 'your-endpoint',  // 最终路径: /dev-api/api/examples/your-endpoint
  method: 'GET',
  body: {
    // 你的响应数据
  },
})
```

## 与模板应用的区别

- **模板应用** Mock 挂载路径: `/dev-api/api/template/`
- **示例应用** Mock 挂载路径: `/dev-api/api/examples/`

两个应用的 Mock 服务互不干扰，可以独立启用和禁用。
