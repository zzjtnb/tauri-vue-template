<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, Switch } from '@tauri-vue-template/ui'
import { computed, onMounted } from 'vue'
import { usePanel } from './usePanel'

const { state, actions } = usePanel()

const platform = computed(() => state.platform.value)
const autostartEnabled = computed(() => Boolean(state.autostartEnabled.value))
const modeLabel = computed(() => state.statusLabel.value)

function updateAutostart(value: boolean | 'indeterminate'): void {
  void actions.toggleAutostart(value === true)
}

onMounted(() => {
  void actions.initialize()
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>桌面与文件能力</CardTitle>
      <CardDescription>Tauri App 内展示系统信息、文件读写、上传和路径打开；桌面端额外展示开机启动、窗口状态和更新检查。</CardDescription>
      <CardAction>
        <Badge :variant="state.available.value ? 'default' : 'secondary'">
          {{ modeLabel }}
        </Badge>
      </CardAction>
    </CardHeader>

    <CardContent class="gap-4 grid">
      <Alert v-if="!state.available.value">
        <AlertTitle>浏览器预览模式</AlertTitle>
        <AlertDescription>当前不展示 Tauri 专属操作；文件读写、原生上传、路径打开、窗口状态和应用更新需要在 Tauri App 内使用。</AlertDescription>
      </Alert>
      <Alert v-else-if="!state.desktop.value">
        <AlertTitle>移动端运行模式</AlertTitle>
        <AlertDescription>当前不展示桌面专属操作：开机启动、窗口状态、应用更新和本地目录打开；通用文件读写、上传与外部链接示例仍可使用。</AlertDescription>
      </Alert>

      <div v-if="state.available.value" class="gap-3 grid md:grid-cols-3">
        <Card class="shadow-none">
          <CardHeader>
            <CardTitle>{{ state.desktop.value ? '系统与启动' : '系统信息' }}</CardTitle>
            <CardDescription>{{ state.desktop.value ? '识别当前系统，并控制是否开机启动。' : '识别当前移动端系统环境。' }}</CardDescription>
            <CardAction v-if="state.desktop.value">
              <Switch
                :checked="autostartEnabled"
                :disabled="state.pending.autostart.value"
                aria-label="开机启动"
                @update:checked="updateAutostart"
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <dl class="text-sm gap-2 grid">
              <div class="flex gap-3 justify-between">
                <dt class="text-muted-foreground">
                  平台
                </dt>
                <dd class="font-medium">
                  {{ platform?.name || '-' }}
                </dd>
              </div>
              <div class="flex gap-3 justify-between">
                <dt class="text-muted-foreground">
                  架构
                </dt>
                <dd class="font-medium">
                  {{ platform?.arch || '-' }}
                </dd>
              </div>
              <div class="flex gap-3 justify-between">
                <dt class="text-muted-foreground">
                  语言
                </dt>
                <dd class="font-medium">
                  {{ platform?.locale || '-' }}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card v-if="state.desktop.value" class="shadow-none">
          <CardHeader>
            <CardTitle>窗口状态</CardTitle>
            <CardDescription>保存或恢复当前窗口布局。</CardDescription>
          </CardHeader>
          <CardContent class="gap-3 grid">
            <div class="gap-2 grid grid-cols-2">
              <Button type="button" variant="outline" @click="actions.saveCurrentWindowState">
                保存布局
              </Button>
              <Button type="button" variant="outline" @click="actions.restoreCurrentWindowState">
                恢复布局
              </Button>
            </div>
            <p class="text-xs text-muted-foreground truncate">
              状态文件：{{ state.windowStateFile.value || '-' }}
            </p>
          </CardContent>
        </Card>

        <Card v-if="state.desktop.value" class="shadow-none">
          <CardHeader>
            <CardTitle>应用更新</CardTitle>
            <CardDescription>使用 Tauri updater 检查桌面端更新。</CardDescription>
          </CardHeader>
          <CardContent class="gap-3 grid">
            <div class="flex flex-wrap gap-2 items-center">
              <Button type="button" variant="outline" :disabled="state.pending.checkUpdate.value" @click="actions.refreshUpdateStatus()">
                {{ state.pending.checkUpdate.value ? '检查中...' : '检查更新' }}
              </Button>
              <Badge variant="secondary">
                {{ state.updateStatus.value }}
              </Badge>
            </div>
            <p v-if="state.updateVersion.value" class="text-xs text-muted-foreground">
              可用版本：{{ state.updateVersion.value }}
            </p>
          </CardContent>
        </Card>

        <Card class="shadow-none md:col-span-3">
          <CardHeader>
            <CardTitle>文件读写与上传</CardTitle>
            <CardDescription>使用 fs 写入/读取 AppData 示例文件，读取用户目录元信息，并使用 upload 插件上传该文件。</CardDescription>
          </CardHeader>
          <CardContent class="gap-3 grid">
            <div class="gap-2 grid sm:flex sm:flex-wrap">
              <Button type="button" variant="outline" :disabled="!state.available.value || state.pending.fsWrite.value" @click="actions.writeSampleFile">
                {{ state.pending.fsWrite.value ? '写入中...' : '写入示例文件' }}
              </Button>
              <Button type="button" variant="outline" :disabled="!state.available.value || state.pending.fsRead.value" @click="actions.readSampleFile">
                {{ state.pending.fsRead.value ? '读取中...' : '读取示例文件' }}
              </Button>
              <Button type="button" variant="outline" :disabled="!state.available.value || state.pending.fsMeta.value" @click="actions.inspectFsMetaScopes">
                {{ state.pending.fsMeta.value ? '读取中...' : '读取目录元信息' }}
              </Button>
              <Button type="button" variant="outline" :disabled="!state.available.value || state.pending.uploadSample.value" @click="actions.uploadSampleFile">
                {{ state.pending.uploadSample.value ? '上传中...' : '上传示例文件' }}
              </Button>
            </div>
            <dl class="text-xs text-muted-foreground gap-2 grid">
              <div class="flex gap-3 justify-between">
                <dt>文件路径</dt>
                <dd class="text-foreground font-medium max-w-[70%] truncate">
                  {{ state.samplePath.value || '-' }}
                </dd>
              </div>
              <div class="flex gap-3 justify-between">
                <dt>上传状态</dt>
                <dd class="text-foreground font-medium">
                  {{ state.uploadStatus.value }} · {{ state.uploadProgress.value }}%
                </dd>
              </div>
            </dl>
            <div v-if="state.scopeMetas.value.length" class="gap-2 grid md:grid-cols-3">
              <div
                v-for="scope in state.scopeMetas.value"
                :key="scope.permission"
                class="text-xs p-3 border rounded-lg bg-muted/40"
              >
                <div class="text-foreground font-semibold">
                  {{ scope.label }}
                </div>
                <div class="text-muted-foreground mt-1">
                  {{ scope.permission }}
                </div>
                <div class="mt-2">
                  {{ scope.status }} · 条目 {{ scope.entries }} · {{ scope.directory ? '目录' : '非目录' }}
                </div>
                <div v-if="scope.error" class="text-destructive mt-2 break-all">
                  {{ scope.error }}
                </div>
              </div>
            </div>
            <pre v-if="state.sampleContent.value" class="text-xs p-3 rounded-lg bg-muted max-h-40 overflow-auto">{{ state.sampleContent.value }}</pre>
          </CardContent>
        </Card>

        <Card class="shadow-none md:col-span-3">
          <CardHeader>
            <CardTitle>{{ state.desktop.value ? '本地路径与外部链接' : '外部链接' }}</CardTitle>
            <CardDescription>{{ state.desktop.value ? '打开应用数据目录、下载目录和模板服务地址。' : '移动端不展示本地目录打开操作，仅保留外部链接示例。' }}</CardDescription>
          </CardHeader>
          <CardContent class="gap-2 grid sm:flex sm:flex-wrap">
            <Button v-if="state.desktop.value" type="button" variant="outline" @click="actions.openAppDataDirectory">
              打开应用数据目录
            </Button>
            <Button v-if="state.desktop.value" type="button" variant="outline" @click="actions.openDownloadsDirectory">
              打开下载目录
            </Button>
            <Button type="button" variant="outline" @click="actions.openProjectWebsite">
              打开模板服务地址
            </Button>
            <Alert v-if="state.errorMessage.value" variant="destructive" class="w-full">
              <AlertTitle>原生能力调用失败</AlertTitle>
              <AlertDescription>{{ state.errorMessage.value }}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
</template>
