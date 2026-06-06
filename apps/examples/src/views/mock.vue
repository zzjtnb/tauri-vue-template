<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface MockStatus {
  name: string
  version: string
  message: string
  features: string[]
  updatedAt: string
}

interface MockComponents {
  categories: Array<{
    id: string
    name: string
    components: string[]
  }>
  total: number
}

interface MockThemes {
  themes: Array<{
    id: string
    name: string
    primary: string
    background: string
    foreground: string
  }>
  current: string
}

interface SearchItem {
  id: string
  title: string
  category: string
  desc: string
}

interface SearchResult {
  keyword: string
  total: number
  items: SearchItem[]
}

const baseApi = import.meta.env.VITE_APP_BASE_API || '/dev-api'
const mockEnabled = import.meta.env.VITE_MOCK_DEV_SERVER === 'true'

const statusData = ref<MockStatus | null>(null)
const componentsData = ref<MockComponents | null>(null)
const themesData = ref<MockThemes | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 搜索
const searchKeyword = ref('')
const searchResult = ref<SearchResult | null>(null)
const searchLoading = ref(false)
const searchError = ref<string | null>(null)

async function fetchMockData() {
  loading.value = true
  error.value = null

  try {
    // 并行请求三个 Mock 接口
    const [statusRes, componentsRes, themesRes] = await Promise.all([
      fetch(`${baseApi}/api/examples/status`),
      fetch(`${baseApi}/api/examples/components`),
      fetch(`${baseApi}/api/examples/themes`),
    ])

    if (!statusRes.ok || !componentsRes.ok || !themesRes.ok) {
      throw new Error('Mock API 请求失败')
    }

    statusData.value = await statusRes.json()
    componentsData.value = await componentsRes.json()
    themesData.value = await themesRes.json()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    console.error('Mock API 调用失败:', err)
  }
  finally {
    loading.value = false
  }
}

async function handleSearch() {
  searchLoading.value = true
  searchError.value = null
  try {
    const res = await fetch(`${baseApi}/api/examples/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: searchKeyword.value }),
    })
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`)
    searchResult.value = await res.json()
  }
  catch (err) {
    searchError.value = err instanceof Error ? err.message : 'Unknown error'
  }
  finally {
    searchLoading.value = false
  }
}

onMounted(() => {
  fetchMockData()
  handleSearch()
})
</script>

<template>
  <div class="mx-auto p-8 max-w-7xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">
        Mock API 示例
      </h1>
      <p class="text-muted-foreground mb-4">
        演示如何在示例应用中调用 Mock API。Mock 服务挂在 <code class="px-2 py-1 rounded bg-muted">{{ baseApi }}/api/examples/</code> 下。
      </p>
      <div class="flex gap-4 items-center">
        <button
          type="button"
          class="text-primary-foreground px-4 py-2 rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50"
          :disabled="loading"
          @click="fetchMockData"
        >
          {{ loading ? '加载中...' : '重新加载' }}
        </button>
        <div
          v-if="mockEnabled"
          class="text-sm text-green-600 dark:text-green-400"
        >
          ✓ Mock 服务已启用
        </div>
        <div
          v-else
          class="text-sm text-yellow-600 dark:text-yellow-400"
        >
          ⚠ Mock 服务未启用
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="text-destructive mb-6 p-4 border border-destructive rounded-md bg-destructive/10"
    >
      <strong>错误：</strong> {{ error }}
    </div>

    <div
      v-if="loading"
      class="text-muted-foreground py-12 text-center"
    >
      加载中...
    </div>

    <div
      v-else-if="statusData && componentsData && themesData"
      class="gap-6 grid lg:grid-cols-3 md:grid-cols-2"
    >
      <!-- 状态信息 -->
      <div class="p-6 border rounded-lg bg-card">
        <h2 class="text-xl font-semibold mb-4">
          状态信息
        </h2>
        <div class="text-sm space-y-2">
          <div>
            <span class="font-medium">名称：</span>
            <span class="text-muted-foreground">{{ statusData.name }}</span>
          </div>
          <div>
            <span class="font-medium">版本：</span>
            <span class="text-muted-foreground">{{ statusData.version }}</span>
          </div>
          <div>
            <span class="font-medium">消息：</span>
            <span class="text-muted-foreground">{{ statusData.message }}</span>
          </div>
          <div class="pt-2">
            <span class="font-medium">特性：</span>
            <ul class="text-muted-foreground mt-2 space-y-1">
              <li
                v-for="feature in statusData.features"
                :key="feature"
                class="flex gap-2 items-center"
              >
                <span class="rounded-full bg-primary h-1.5 w-1.5" />
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 组件信息 -->
      <div class="p-6 border rounded-lg bg-card">
        <h2 class="text-xl font-semibold mb-4">
          组件分类 ({{ componentsData.total }} 个)
        </h2>
        <div class="text-sm space-y-4">
          <div
            v-for="category in componentsData.categories"
            :key="category.id"
          >
            <div class="font-medium mb-2">
              {{ category.name }}
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="comp in category.components"
                :key="comp"
                class="text-xs text-muted-foreground px-2 py-1 rounded bg-muted"
              >
                {{ comp }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主题信息 -->
      <div class="p-6 border rounded-lg bg-card">
        <h2 class="text-xl font-semibold mb-4">
          主题配置
        </h2>
        <div class="text-sm space-y-4">
          <div
            v-for="theme in themesData.themes"
            :key="theme.id"
            class="p-3 border rounded-md"
            :class="{ 'border-primary': theme.id === themesData.current }"
          >
            <div class="font-medium mb-2 flex gap-2 items-center">
              {{ theme.name }}
              <span
                v-if="theme.id === themesData.current"
                class="text-xs text-primary"
              >
                (当前)
              </span>
            </div>
            <div class="text-xs text-muted-foreground space-y-1">
              <div>主色: {{ theme.primary }}</div>
              <div>背景: {{ theme.background }}</div>
              <div>前景: {{ theme.foreground }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- POST 搜索示例 -->
    <div class="mt-8 p-6 border rounded-lg bg-card">
      <h2 class="text-xl font-semibold mb-1">
        POST 搜索示例
      </h2>
      <p class="text-sm text-muted-foreground mb-4">
        输入关键词，通过 <code class="px-1.5 py-0.5 rounded bg-muted">POST /api/examples/search</code> 搜索组件。留空则返回全部。
      </p>
      <form
        class="mb-4 flex gap-2"
        @submit.prevent="handleSearch"
      >
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索组件名称、分类或描述..."
          class="text-sm text-foreground px-3 border rounded-md bg-background flex-1 h-9 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
        <button
          type="submit"
          class="text-sm text-primary-foreground font-medium px-4 rounded-md bg-primary h-9 hover:bg-primary/90 disabled:opacity-50"
          :disabled="searchLoading"
        >
          {{ searchLoading ? '搜索中...' : '搜索' }}
        </button>
      </form>

      <div
        v-if="searchError"
        class="text-sm text-destructive mb-4 p-3 border border-destructive rounded-md bg-destructive/10"
      >
        {{ searchError }}
      </div>

      <div v-if="searchResult">
        <p class="text-sm text-muted-foreground mb-3">
          关键词 <strong class="text-foreground">「{{ searchResult.keyword || '（全部）' }}」</strong> 共命中 {{ searchResult.total }} 条
        </p>
        <div
          v-if="searchResult.items.length"
          class="gap-2 grid lg:grid-cols-3 sm:grid-cols-2"
        >
          <div
            v-for="item in searchResult.items"
            :key="item.id"
            class="p-3 border rounded-md bg-muted/40 flex flex-col gap-1"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">{{ item.title }}</span>
              <span class="text-xs text-primary px-1.5 py-0.5 rounded bg-primary/10">{{ item.category }}</span>
            </div>
            <span class="text-xs text-muted-foreground">{{ item.desc }}</span>
          </div>
        </div>
        <p
          v-else
          class="text-sm text-muted-foreground"
        >
          没有匹配结果
        </p>
      </div>
    </div>

    <!-- Mock API 说明 -->
    <div class="mt-8 p-6 border rounded-lg bg-muted/50">
      <h2 class="text-xl font-semibold mb-4">
        Mock API 说明
      </h2>
      <div class="text-sm text-muted-foreground space-y-4">
        <div>
          <h3 class="text-foreground font-medium mb-2">
            配置位置
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li><code>apps/examples/mock/base.ts</code> - Mock 路径配置</li>
            <li><code>apps/examples/mock/examples/status.ts</code> - 状态接口</li>
            <li><code>apps/examples/mock/examples/components.ts</code> - 组件接口</li>
            <li><code>apps/examples/mock/examples/themes.ts</code> - 主题接口</li>
            <li><code>apps/examples/mock/examples/search.ts</code> - 搜索接口（POST）</li>
          </ul>
        </div>
        <div>
          <h3 class="text-foreground font-medium mb-2">
            启用方式
          </h3>
          <p>在 <code>.env.development</code> 中设置：</p>
          <pre class="text-xs mt-2 p-2 rounded bg-background">VITE_MOCK_DEV_SERVER=true</pre>
        </div>
        <div>
          <h3 class="text-foreground font-medium mb-2">
            接口路径
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li><code>GET /dev-api/api/examples/status</code></li>
            <li><code>GET /dev-api/api/examples/components</code></li>
            <li><code>GET /dev-api/api/examples/themes</code></li>
            <li><code>POST /dev-api/api/examples/search</code> — body: <code>{ keyword: string }</code></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
