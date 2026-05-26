<script setup lang="ts">
import { ref } from 'vue'
import BrandSidebar from './components/BrandSidebar.vue'
import MainContent from './components/MainContent.vue'

const currentFilter = ref('全部')
const selectedBrand = ref('any')

function handleSelectBrand(brandKey: string): void {
  selectedBrand.value = brandKey
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 页面标题 -->
    <div class="flex flex-col gap-2">
      <h1 class="text-4xl font-bold font-serif flex gap-3 items-center">
        <i class="i-lucide-credit-card size-8" />
        虚拟信用卡生成器
      </h1>
      <p class="text-muted-foreground">
        基于 Luhn 算法的虚拟卡号生成和验证工具，仅供开发测试使用
      </p>
    </div>

    <!-- 主布局：左侧边栏 + 右侧内容 -->
    <div class="gap-6 grid lg:grid-cols-4">
      <!-- 左侧：品牌侧边栏 -->
      <div class="lg:col-span-1">
        <BrandSidebar
          v-model:current-filter="currentFilter"
          v-model:selected-brand="selectedBrand"
          @select-brand="handleSelectBrand"
        />
      </div>

      <!-- 右侧：主内容 -->
      <div class="lg:col-span-3">
        <MainContent v-model:selected-brand="selectedBrand" />
      </div>
    </div>
  </div>
</template>
