<script setup lang="ts">
import { computed } from 'vue'
import { BRAND_CONFIG, identifyBrand } from '../utils/generator'

interface Emits {
  (event: 'selectPrefix', prefix: string): void
}

const emit = defineEmits<Emits>()

// 与生成表单的自定义 BIN/IIN 输入保持一致：推荐值使用 6 位常见前缀。
const recommendedPrefixes = [
  '415464', // Visa - 真实示例
  '379240', // American Express - 真实示例
  '522954', // Mastercard - 真实示例
  '552461', // Mastercard - 真实示例
  '414720', // Visa - Chase Bank (https://www.bindb.com)
  '378282', // American Express (https://www.bindb.com)
  '511111', // Mastercard (https://www.bindb.com)
  '601111', // Discover (https://www.bindb.com)
  '353011', // JCB (https://www.bindb.com)
  '300000', // Diners Club (https://www.bindb.com)
]

const references = [
  { name: '按国家/地区探索', url: 'https://bincheck.io/zh/us' },
  { name: 'BIN/IIN 查询', url: 'https://bincheck.org' },
  { name: 'BIN 数据库', url: 'https://www.bindb.com/bin-list' },
  { name: 'BIN 代码', url: 'https://www.bincodes.com' },
  { name: 'BinList.net', url: 'https://binlist.net' },
  { name: 'BinList.io', url: 'https://binlist.io' },
]

const prefixBrandMap = computed(() => {
  const map: Record<string, { brandName: string, brandKey: string } | null> = {}
  for (const prefix of recommendedPrefixes) {
    const brandName = identifyBrand(prefix)
    const brandEntry = Object.entries(BRAND_CONFIG).find(([_, config]) => config.name === brandName)
    map[prefix] = brandEntry
      ? { brandName: brandEntry[1].name, brandKey: brandEntry[0] }
      : null
  }
  return map
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="p-4 border border-border rounded-lg bg-card shadow-sm">
      <h3 class="font-semibold mb-3">
        参考资源
      </h3>
      <div class="gap-2 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
        <a
          v-for="reference in references"
          :key="reference.url"
          :href="reference.url"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 rounded flex gap-2 items-center hover:bg-muted"
        >
          <i class="i-lucide-link flex-shrink-0 size-4" />
          <span class="text-sm font-medium">{{ reference.name }}:</span>
          <span class="text-sm text-primary break-all">{{ reference.url }}</span>
        </a>
      </div>
    </div>

    <div class="p-4 border border-border rounded-lg bg-card shadow-sm">
      <h3 class="font-semibold mb-3">
        常用卡头推荐
      </h3>
      <div class="gap-2 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        <button
          v-for="prefix in recommendedPrefixes"
          :key="prefix"
          type="button"
          class="p-2 text-left border-2 border-muted rounded flex cursor-pointer transition-colors items-center justify-between hover:border-border/50 hover:bg-muted"
          @click="emit('selectPrefix', prefix)"
        >
          <span class="flex gap-2 min-w-0 items-center">
            <i
              v-if="prefixBrandMap[prefix]"
              :class="`${BRAND_CONFIG[prefixBrandMap[prefix]!.brandKey as keyof typeof BRAND_CONFIG]?.logo} size-4 flex-shrink-0`"
            />
            <span class="text-sm font-semibold truncate">{{ prefix }}</span>
          </span>
          <span class="text-xs ml-2 opacity-60 flex-shrink-0">{{ prefixBrandMap[prefix]?.brandName || '未知' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
