<script setup lang="ts">
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/shadcn-vue/ui/resizable'
import { Separator } from '@/components/shadcn-vue/ui/separator'
import ChartCarouselDemo from './ChartCarouselDemo.vue'
import SidebarDemo from './SidebarDemo.vue'
</script>

<template>
  <div class="flex flex-col gap-6">
    <ChartCarouselDemo />

    <Separator />

    <SidebarDemo />

    <Separator />

    <!-- Resizable 可调整大小面板 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Resizable 可调整大小面板
      </h3>
      <ResizablePanelGroup direction="horizontal" class="border rounded-lg min-h-[220px]">
        <ResizablePanel :default-size="28" :min-size="20">
          <div class="p-4 flex flex-col gap-3 h-full">
            <p class="text-sm font-medium">
              左侧面板
            </p>
            <p class="text-sm text-muted-foreground">
              拖动中间把手可改变面板宽度。
            </p>
          </div>
        </ResizablePanel>
        <ResizableHandle with-handle />
        <ResizablePanel :default-size="72">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel :default-size="58">
              <div class="text-sm text-muted-foreground p-4 flex h-full items-center justify-center">
                主内容区域
              </div>
            </ResizablePanel>
            <ResizableHandle with-handle />
            <ResizablePanel :default-size="42">
              <div class="text-sm text-muted-foreground p-4 flex h-full items-center justify-center">
                底部日志区域
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </div>
</template>
