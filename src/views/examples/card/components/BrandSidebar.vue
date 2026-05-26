<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/shadcn-vue/ui/badge'
import { Button } from '@/components/shadcn-vue/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-vue/ui/card'
import { BRAND_CONFIG } from '../utils/generator'

interface Props {
  currentFilter: string
  selectedBrand: string | null
}

interface Emits {
  (e: 'update:currentFilter', value: string): void
  (e: 'update:selectedBrand', value: string): void
  (e: 'selectBrand', value: string): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const filterOptions = ['全部', '主流', '全球', '中国', '美国', '亚太', '欧洲']

const allBrands = computed(() => Object.values(BRAND_CONFIG))

const filteredBrands = computed(() => {
  if (props.currentFilter === '全部') {
    return allBrands.value
  }
  if (props.currentFilter === '主流') {
    return allBrands.value.filter(b => b.popular)
  }
  return allBrands.value.filter(b => b.region.includes(props.currentFilter))
})

const selectedBrandConfig = computed(() => {
  if (!props.selectedBrand)
    return null
  return BRAND_CONFIG[props.selectedBrand as keyof typeof BRAND_CONFIG]
})

function getBrandStyle(brand: typeof allBrands.value[0]) {
  if (props.selectedBrand !== brand.key)
    return { borderColor: 'var(--border)' }

  if (!brand.color)
    return { borderColor: 'var(--border)' }

  return {
    backgroundColor: `color-mix(in srgb, ${brand.color} 30%, transparent)`,
    borderColor: brand.color,
  }
}

function handleFilterChange(filter: string): void {
  emit('update:currentFilter', filter)
}

function handleBrandSelect(brandKey: string): void {
  emit('update:selectedBrand', brandKey)
  emit('selectBrand', brandKey)
}
</script>

<template>
  <div class="space-y-4">
    <!-- 快捷筛选 -->
    <div class="p-4 border border-border rounded-lg bg-card shadow-sm">
      <h3 class="font-semibold mb-3">
        快捷筛选
      </h3>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="filter in filterOptions"
          :key="filter"
          :variant="props.currentFilter === filter ? 'outline' : 'default'"
          size="sm"
          @click="handleFilterChange(filter)"
        >
          {{ filter }}
        </Button>
      </div>
    </div>

    <!-- 品牌列表 -->
    <div class="p-4 border border-border rounded-lg bg-card shadow-sm">
      <h3 class="font-semibold mb-3">
        品牌列表
        <span class="text-xs text-muted-foreground">({{ filteredBrands.length }}个)</span>
      </h3>
      <ul class="space-y-2">
        <li
          v-for="brand in filteredBrands"
          :key="brand.key"
          class="p-2 border rounded cursor-pointer backdrop-blur-sm"
          :class="[
            props.selectedBrand === brand.key
              ? 'text-foreground'
              : '',
          ]"
          :style="getBrandStyle(brand)"
          @click="handleBrandSelect(brand.key)"
        >
          <div class="flex gap-2 items-start justify-between">
            <div class="flex flex-1 gap-2 items-center">
              <i :class="`${brand.logo} h-5 w-5 flex-shrink-0`" />
              <div>
                <div class="font-medium flex gap-1 items-center">
                  {{ brand.name }}
                  <i v-if="brand.popular" class="i-lucide-star text-warning size-4" />
                </div>
                <div class="text-xs">
                  {{ brand.nameZh }}
                </div>
              </div>
            </div>
          </div>
          <div class="text-xs mt-2 opacity-70 space-y-1">
            <div>{{ brand.region }}</div>
            <div>{{ brand.validLengths.join('/') }}位 | {{ brand.format }} | {{ brand.ranges.length }}个 IIN</div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 品牌详情 -->
    <Card v-if="selectedBrandConfig">
      <CardHeader>
        <div class="flex gap-3 items-center">
          <i :class="`${selectedBrandConfig.logo} h-8 w-8`" />
          <div>
            <CardTitle>{{ selectedBrandConfig.name }}</CardTitle>
            <CardDescription>{{ selectedBrandConfig.nameZh }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="space-y-2">
          <div>
            <span class="text-sm font-semibold mb-2 block">发卡行识别号 (IIN):</span>
            <div class="p-2 border rounded bg-muted/30 max-h-40 overflow-y-auto">
              <div class="space-y-1">
                <div v-for="(range, idx) in selectedBrandConfig.ranges" :key="idx" class="text-xs font-mono">
                  <span class="text-muted-foreground">{{ range.iin }}</span>
                  <span v-if="range.min !== undefined && range.max !== undefined" class="text-muted-foreground">
                    ({{ range.min }}-{{ range.max }})
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-sm font-semibold">有效长度:</span>
            <span class="text-sm">{{ selectedBrandConfig.validLengths.join(', ') }} 位</span>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-sm font-semibold">CVV:</span>
            <span class="text-sm">{{ selectedBrandConfig.cvvLength }} 位</span>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-sm font-semibold">格式:</span>
            <span class="text-sm">{{ selectedBrandConfig.format }}</span>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-sm font-semibold">地区:</span>
            <span class="text-sm">{{ selectedBrandConfig.region }}</span>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-sm font-semibold">主流:</span>
            <Badge :variant="selectedBrandConfig.popular ? 'default' : 'secondary'">
              {{ selectedBrandConfig.popular ? '是' : '否' }}
            </Badge>
          </div>
          <div v-if="selectedBrandConfig.color" class="flex items-start justify-between">
            <span class="text-sm font-semibold">品牌色:</span>
            <div class="flex gap-2 items-center">
              <div class="border rounded h-5 w-5" :style="{ backgroundColor: selectedBrandConfig.color }" />
              <span class="text-sm">{{ selectedBrandConfig.color }}</span>
            </div>
          </div>
          <div v-if="selectedBrandConfig.website" class="flex items-start justify-between">
            <span class="text-sm font-semibold">官网:</span>
            <a :href="selectedBrandConfig.website" target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:text-primary/80 hover:underline">
              {{ selectedBrandConfig.website }}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card v-else>
      <CardContent class="pt-6">
        <p class="text-sm text-muted-foreground">
          点击品牌查看详细信息
        </p>
      </CardContent>
    </Card>
  </div>
</template>
