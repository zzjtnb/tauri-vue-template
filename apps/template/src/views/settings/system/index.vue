<script setup lang="ts">
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tauri-vue-template/ui'
import { computed } from 'vue'
import { useAppStore } from '@/stores'

interface Row {
  label: string
  value: string
}

const appStore = useAppStore()

const appRows = computed<Row[]>(() => [
  { label: '包名', value: appStore.system.name },
  { label: '版本', value: appStore.system.version },
  { label: '标题', value: appStore.system.title },
  { label: 'Vite 模式', value: appStore.system.mode },
  { label: '开发环境', value: formatBoolean(appStore.system.dev) },
  { label: '生产环境', value: formatBoolean(appStore.system.prod) },
])

const envRows = computed<Row[]>(() => [
  { label: '开发端口', value: formatNullable(appStore.envConfig.appPort) },
  { label: '请求前缀', value: appStore.envConfig.appBaseApi || '-' },
  { label: '接口地址', value: appStore.envConfig.appApiUrl || '-' },
  { label: '存储前缀', value: appStore.envConfig.storeKeyPrefix },
  { label: '上传示例地址', value: appStore.envConfig.uploadDemoUrl || '-' },
  { label: 'Mock 服务', value: formatBoolean(appStore.envConfig.mockDevServer) },
  { label: '调试日志', value: formatBoolean(appStore.envConfig.debug) },
  { label: 'UnoCSS 配置调试', value: formatBoolean(appStore.envConfig.unoCssConfigDebug) },
  { label: '路由来源', value: appStore.envConfig.routeSource },
])

const buildRows = computed<Row[]>(() => [
  { label: '构建模式', value: __APP_INFO__.mode },
  { label: '构建时间', value: formatTimestamp(__APP_INFO__.buildTimestamp) },
  { label: 'Node 版本要求', value: __APP_INFO__.pkg.engines.node },
  { label: '运行依赖数量', value: String(Object.keys(__APP_INFO__.pkg.dependencies).length) },
  { label: '开发依赖数量', value: String(Object.keys(__APP_INFO__.pkg.devDependencies).length) },
])

const dependencyRows = computed<Row[]>(() => [
  ...Object.entries(__APP_INFO__.pkg.dependencies).map(([label, value]) => ({ label, value })),
  ...Object.entries(__APP_INFO__.pkg.devDependencies).map(([label, value]) => ({ label: `${label} (dev)`, value })),
])
const dependencyCount = computed(() => Object.keys(__APP_INFO__.pkg.dependencies).length)
const devDependencyCount = computed(() => Object.keys(__APP_INFO__.pkg.devDependencies).length)
const serializedAppInfo = computed(() => JSON.stringify(__APP_INFO__, null, 2))

function formatBoolean(value: boolean): string {
  return value ? '是' : '否'
}

function formatNullable(value: number | string | null): string {
  return value === null || value === '' ? '-' : String(value)
}

function formatTimestamp(value: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
  }).format(new Date(value))
}
</script>

<template>
  <div class="gap-4 grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <Card class="shadow-none">
      <CardHeader>
        <CardTitle>应用运行信息</CardTitle>
        <CardDescription>来自应用 Store 的系统快照和当前 Vite 运行态。</CardDescription>
      </CardHeader>
      <CardContent>
        <dl class="text-sm gap-3 grid">
          <div v-for="row in appRows" :key="row.label" class="flex gap-3 justify-between">
            <dt class="text-muted-foreground">
              {{ row.label }}
            </dt>
            <dd class="font-medium text-right break-all">
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>

    <Card class="shadow-none">
      <CardHeader>
        <CardTitle>环境变量派生配置</CardTitle>
        <CardDescription>展示模板从 import.meta.env 解析后的配置结果。</CardDescription>
      </CardHeader>
      <CardContent>
        <dl class="text-sm gap-3 grid">
          <div v-for="row in envRows" :key="row.label" class="flex gap-3 justify-between">
            <dt class="text-muted-foreground">
              {{ row.label }}
            </dt>
            <dd class="font-medium text-right break-all">
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>

    <Card class="shadow-none">
      <CardHeader>
        <CardTitle>构建期 __APP_INFO__</CardTitle>
        <CardDescription>展示 Vite define 注入的构建期包信息、模式和依赖数量。</CardDescription>
      </CardHeader>
      <CardContent class="gap-4 grid">
        <dl class="text-sm gap-3 grid">
          <div v-for="row in buildRows" :key="row.label" class="flex gap-3 justify-between">
            <dt class="text-muted-foreground">
              {{ row.label }}
            </dt>
            <dd class="font-medium text-right break-all">
              {{ row.value }}
            </dd>
          </div>
        </dl>
        <div class="flex flex-wrap gap-2">
          <Badge variant="secondary">
            dependencies {{ dependencyCount }}
          </Badge>
          <Badge variant="outline">
            devDependencies {{ devDependencyCount }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-none">
      <CardHeader>
        <CardTitle>依赖版本</CardTitle>
        <CardDescription>直接来自 package.json 的版本范围，用于模板排查和示例展示。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="text-sm pr-1 gap-2 grid max-h-80 overflow-auto">
          <div v-for="row in dependencyRows" :key="row.label" class="pb-2 border-b border-border/60 flex gap-3 justify-between last:border-b-0">
            <span class="text-muted-foreground break-all">{{ row.label }}</span>
            <span class="font-medium text-right break-all">{{ row.value }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-none xl:col-span-2">
      <CardHeader>
        <CardTitle>__APP_INFO__ 原始内容</CardTitle>
        <CardDescription>完整 JSON 快照，方便确认构建期注入字段是否符合预期。</CardDescription>
      </CardHeader>
      <CardContent>
        <pre class="text-xs p-3 rounded-lg bg-muted max-h-96 overflow-auto">{{ serializedAppInfo }}</pre>
      </CardContent>
    </Card>
  </div>
</template>
