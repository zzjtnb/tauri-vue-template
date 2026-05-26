<script setup lang="ts">
import type { CardValidationResult, VirtualCard } from '../types'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/shadcn-vue/ui/button'
import { Input } from '@/components/shadcn-vue/ui/input'
import { Label } from '@/components/shadcn-vue/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-vue/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-vue/ui/tabs'
import { BRAND_CONFIG, formatPan, generateCards, SUPPORTED_LOCALES, validateCardNumberDetailed } from '../utils/generator'
import PrefixRecommendations from './PrefixRecommendations.vue'

interface Props {
  selectedBrand: string
}

interface Emits {
  (e: 'update:selectedBrand', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTab = ref('generate')
const selectedLocale = ref('en')
const customPrefix = ref('')
const generateCount = ref(1)
const cardInput = ref('')
const generatedCards = ref<VirtualCard[]>([])
const validationResult = ref<CardValidationResult | null>(null)

// 与 generateCards 的参数验证保持一致：一次最多生成 100 张。
const normalizedCount = computed({
  get: () => generateCount.value,
  set: (val) => {
    generateCount.value = Math.min(Math.max(val, 1), 100)
  },
})

const allBrands = Object.entries(BRAND_CONFIG).map(([brandKey, config]) => ({
  ...config,
  key: brandKey,
}))

function handleGenerate(): void {
  try {
    const cards = generateCards(props.selectedBrand, generateCount.value, customPrefix.value, selectedLocale.value)
    generatedCards.value = cards
    toast.success('成功', { description: `已生成 ${cards.length} 张卡片` })
  }
  catch (error) {
    toast.error('错误', { description: error instanceof Error ? error.message : '生成失败' })
  }
}

function handleValidate(): void {
  if (!cardInput.value.trim()) {
    toast.error('错误', { description: '请输入卡号' })
    return
  }
  validationResult.value = validateCardNumberDetailed(cardInput.value)
}

function handleClear(): void {
  generatedCards.value = []
  customPrefix.value = ''
  generateCount.value = 1
  cardInput.value = ''
  validationResult.value = null
  toast.success('已清空', { description: '所有数据已清除' })
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('已复制')
  })
}

function getCardStyle(brandName: string) {
  const brandKey = Object.entries(BRAND_CONFIG).find(([_, config]) => config.name === brandName)?.[0]
  if (!brandKey)
    return { backgroundColor: 'var(--muted)' }

  const brandConfig = BRAND_CONFIG[brandKey as keyof typeof BRAND_CONFIG]
  if (!brandConfig.color)
    return { backgroundColor: 'var(--muted)' }

  return {
    backgroundColor: `color-mix(in srgb, ${brandConfig.color} 30%, transparent)`,
  }
}

function getBrandLogo(brandName: string): string {
  const brandConfig = Object.entries(BRAND_CONFIG).find(([_, config]) => config.name === brandName)?.[1]
  return brandConfig?.logo || 'i-lucide-credit-card'
}

function handleSelectPrefix(prefix: string): void {
  customPrefix.value = prefix
  activeTab.value = 'generate'
}
</script>

<template>
  <Tabs v-model="activeTab" class="w-full">
    <TabsList class="grid grid-cols-3 w-full">
      <TabsTrigger value="generate">
        生成卡号
      </TabsTrigger>
      <TabsTrigger value="recommendations">
        卡头推荐
      </TabsTrigger>
      <TabsTrigger value="validate">
        验证卡号
      </TabsTrigger>
    </TabsList>

    <!-- 生成卡号 Tab -->
    <TabsContent value="generate" class="space-y-6">
      <div class="p-6 border border-border rounded-lg bg-card shadow-sm">
        <div class="gap-4 grid md:grid-cols-2">
          <div class="space-y-2">
            <Label for="brand">品牌</Label>
            <Select :model-value="selectedBrand" @update:model-value="(value) => emit('update:selectedBrand', value as string)">
              <SelectTrigger id="brand">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">
                  随机(主流品牌)
                </SelectItem>
                <SelectItem v-for="brand in allBrands" :key="brand.key" :value="brand.key">
                  {{ brand.name }} ({{ brand.nameZh }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="locale">持卡人地区</Label>
            <Select v-model="selectedLocale">
              <SelectTrigger id="locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(config, code) in SUPPORTED_LOCALES" :key="code" :value="code">
                  {{ config.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="prefix">自定义BIN(可选)</Label>
            <Input id="prefix" v-model="customPrefix" type="text" placeholder="如:415464" maxlength="8" />
          </div>

          <div class="space-y-2">
            <Label for="count">生成数量(1-100)</Label>
            <Input id="count" v-model.number="normalizedCount" type="number" min="1" max="100" />
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <Button @click="handleGenerate">
            生成
          </Button>
          <Button variant="ghost" size="sm" @click="handleClear">
            <i class="i-lucide-trash-2 mr-2" />
            清空
          </Button>
        </div>

        <!-- 生成的卡片 -->
        <div v-if="generatedCards.length > 0" class="mt-6 space-y-4">
          <p class="text-sm text-muted-foreground">
            生成了 {{ generatedCards.length }} 张卡片,点击任意字段复制
          </p>
          <div class="gap-4 grid lg:grid-cols-3 md:grid-cols-2">
            <div
              v-for="(card, index) in generatedCards"
              :key="index"
              class="text-white/80 p-6 border border-border rounded-lg flex flex-col aspect-video justify-between"
              :style="getCardStyle(card.brand)"
            >
              <!-- 顶部:品牌 logo 和序号 -->
              <div class="flex items-center justify-between">
                <div class="flex gap-2 items-center">
                  <i :class="`${getBrandLogo(card.brand)} h-6 w-6`" />
                  <span class="text-lg text-white font-semibold mix-blend-difference">{{ card.brand }}</span>
                </div>
                <span class="text-xs text-white/80 mix-blend-difference">#{{ index + 1 }}</span>
              </div>

              <!-- 中间:卡号 -->
              <div
                class="group text-xl tracking-wider font-mono font-semibold px-2 py-2 rounded bg-black/20 flex cursor-pointer items-center justify-between"
                title="点击复制卡号"
                @click="copyToClipboard(card.number)"
              >
                <span class="text-white mix-blend-difference">{{ formatPan(card.number) }}</span>
                <i class="i-lucide-copy ml-2 opacity-0 flex-shrink-0 h-4 w-4 transition-opacity group-hover:opacity-100" />
              </div>

              <!-- 底部:姓名,有效期,CVV -->
              <div class="flex items-end justify-between">
                <div
                  class="flex-1 cursor-pointer"
                  title="点击复制姓名"
                  @click="copyToClipboard(card.name)"
                >
                  <div class="text-xs text-white/80 mb-1 mix-blend-difference">
                    持卡人
                  </div>
                  <div class="text-white font-semibold mix-blend-difference">
                    {{ card.name }}
                  </div>
                </div>

                <div class="ml-4 flex gap-4">
                  <div
                    class="cursor-pointer"
                    title="点击复制有效期"
                    @click="copyToClipboard(card.expiry)"
                  >
                    <div class="text-xs text-white/80 mb-1 mix-blend-difference">
                      有效期
                    </div>
                    <div class="text-white font-mono font-semibold mix-blend-difference">
                      {{ card.expiry }}
                    </div>
                  </div>
                  <div
                    class="cursor-pointer"
                    title="点击复制CVV"
                    @click="copyToClipboard(card.cvv)"
                  >
                    <div class="text-xs text-white/80 mb-1 mix-blend-difference">
                      CVV
                    </div>
                    <div class="text-white font-mono font-semibold mix-blend-difference">
                      {{ card.cvv }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>

    <!-- 验证卡号 Tab -->
    <TabsContent value="validate" class="space-y-6">
      <div class="p-6 border border-border rounded-lg bg-card shadow-sm">
        <div class="space-y-2">
          <Label for="card-input">输入卡号</Label>
          <Input id="card-input" v-model="cardInput" type="text" placeholder="输入要验证的卡号" maxlength="19" @keyup.enter="handleValidate" />
        </div>

        <div class="mt-4 flex gap-2">
          <Button @click="handleValidate">
            验证
          </Button>
          <Button variant="ghost" size="sm" @click="handleClear">
            <i class="i-lucide-trash-2 mr-2" />
            清空
          </Button>
        </div>

        <!-- 验证结果 -->
        <div v-if="validationResult" class="mt-6 p-6 border border-border rounded-lg bg-card shadow-sm space-y-4">
          <div class="flex gap-3 items-center">
            <i :class="validationResult.valid ? 'i-lucide-circle-check text-success' : 'i-lucide-circle-alert text-destructive'" class="size-6" />
            <h3 class="text-lg font-semibold">
              {{ validationResult.valid ? '验证通过' : '验证失败' }}
            </h3>
          </div>

          <div class="gap-4 grid grid-cols-3">
            <div class="p-3 border border-border rounded flex gap-3 items-start">
              <i :class="`${getBrandLogo(validationResult.brand)} mt-0.5 flex-shrink-0 h-5 w-5`" />
              <div>
                <div class="text-xs mb-1 opacity-70">
                  品牌
                </div>
                <div class="font-semibold">
                  {{ validationResult.brand }}
                </div>
              </div>
            </div>
            <div class="p-3 border border-border rounded flex gap-3 items-start">
              <i class="i-lucide-ruler mt-0.5 flex-shrink-0 h-5 w-5" />
              <div>
                <div class="text-xs mb-1 opacity-70">
                  长度
                </div>
                <div class="font-semibold">
                  {{ validationResult.length }} 位
                </div>
              </div>
            </div>
            <div class="p-3 border border-border rounded flex gap-3 items-start">
              <i :class="validationResult.errors.length === 0 ? 'i-lucide-check-circle text-success' : 'i-lucide-alert-circle text-destructive'" class="mt-0.5 flex-shrink-0 size-5" />
              <div>
                <div class="text-xs mb-1 opacity-70">
                  问题
                </div>
                <div class="font-semibold">
                  {{ validationResult.errors.length + validationResult.warnings.length }} 个
                </div>
              </div>
            </div>
          </div>

          <div v-if="validationResult.errors.length > 0" class="p-3 border border-destructive/30 rounded bg-destructive/5">
            <div class="text-destructive font-semibold mb-2 flex gap-2 items-center">
              <i class="i-lucide-alert-circle size-4" />
              错误
            </div>
            <ul class="ml-6 space-y-1">
              <li v-for="(error, i) in validationResult.errors" :key="`error-${i}`" class="text-sm">
                • {{ error }}
              </li>
            </ul>
          </div>

          <div v-if="validationResult.warnings.length > 0" class="p-3 border border-warning/30 rounded bg-warning/5">
            <div class="text-warning font-semibold mb-2 flex gap-2 items-center">
              <i class="i-lucide-triangle-alert size-4" />
              警告
            </div>
            <ul class="ml-6 space-y-1">
              <li v-for="(warning, i) in validationResult.warnings" :key="`warning-${i}`" class="text-sm">
                • {{ warning }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </TabsContent>

    <!-- 卡头推荐 Tab -->
    <TabsContent value="recommendations" class="space-y-6">
      <PrefixRecommendations @select-prefix="handleSelectPrefix" />

      <!-- BIN 号码信息 -->
      <div class="p-4 border border-border rounded-lg bg-card shadow-sm space-y-4">
        <div>
          <h3 class="font-semibold mb-2">
            什么是 BIN 号码?
          </h3>
          <p class="text-sm text-muted-foreground">
            BIN 代表银行识别号码(Bank Identification Number).它是信用卡号的前 6 位数字,用于识别向持卡人发行卡的金融机构.BIN 可用于识别信用卡、借记卡、预付卡和奖励卡的发卡金融机构.
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            什么是 IIN 号码?
          </h3>
          <p class="text-sm text-muted-foreground space-y-2">
            <span class="block">IIN 代表发卡机构识别号码(Issuer Identification Number).它是信用卡号的前 6 位或 8 位数字,用于识别发卡机构.IIN 是 BIN 的扩展概念,可以是 6 位或 8 位.</span>
            <span class="block">信用卡号的首位数字称为主要行业标识符 (MII).向持卡人发卡的机构由 IIN 号标识.剩余数字由发卡机构分配.数字的数量决定了卡号的长度.</span>
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            BIN 和 IIN 的区别
          </h3>
          <p class="text-sm text-muted-foreground space-y-2">
            <span class="block"><span class="font-medium">BIN (银行识别号码):</span> 固定为 6 位数字,是国际标准的早期定义,用于识别发卡银行.</span>
            <span class="block"><span class="font-medium">IIN (发卡机构识别号码):</span> 可以是 6 位或 8 位数字,是现代标准(ISO/IEC 7812-1:2015),提供更多的发卡机构识别空间.</span>
            <span class="block"><span class="font-medium">关系:</span> IIN 是 BIN 的现代扩展,所有 BIN 都是 IIN,但不是所有 IIN 都是 BIN.在实际应用中,两个术语经常互换使用.</span>
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            卡号格式结构
          </h3>
          <p class="text-sm text-muted-foreground mb-2">
            根据 ISO/IEC 7812 标准,信用卡和借记卡号码的长度为 13-19 位.
          </p>
          <div class="text-xs font-mono mb-2 p-3 rounded bg-muted/50">
            PQQQQRRRRRRRRRRRS
          </div>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li><span class="font-medium">P</span> - 主要行业标识符 (MII)</li>
            <li><span class="font-medium">QQQQQ</span> - 发卡金融机构标识符 (IIN/BIN 的其余部分)</li>
            <li><span class="font-medium">R</span> - 账户标识符 (最多 12 位)</li>
            <li><span class="font-medium">S</span> - 校验位 (Luhn 算法计算)</li>
          </ul>
          <p class="text-sm text-muted-foreground mt-2">
            其中 PQQQQQ 组合称为 BIN 号码(前 6 位)或 IIN 代码(前 6-8 位).
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            信用卡号码特点
          </h3>
          <ul class="text-sm text-muted-foreground space-y-2">
            <li>• 长度: 通常 16 位 (Visa、Mastercard、Discover)</li>
            <li>• 有效期: 通常 3-5 年</li>
            <li>• CVV: 3 位验证码 (背面)</li>
            <li>• 发卡机构: 银行或金融机构</li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            借记卡号码特点
          </h3>
          <ul class="text-sm text-muted-foreground space-y-2">
            <li>• 长度: 通常 16-19 位</li>
            <li>• 有效期: 通常 3-5 年</li>
            <li>• CVV: 3 位验证码 (背面)</li>
            <li>• 发卡机构: 银行</li>
            <li>• 特点: 直接从银行账户扣款,无透支功能</li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            BIN/IIN 号码的用途
          </h3>
          <ul class="text-sm text-muted-foreground space-y-2">
            <li>• 商家通常使用它来识别信用卡的卡类型和发卡银行.</li>
            <li>• 它也有助于防止欺诈.如果账单地址与卡的发卡国家不同,可能是欺诈交易.通过 BIN/IIN 查询,他们可以轻松识别此类交易.</li>
            <li>• 用于风险评估和交易验证.</li>
          </ul>
        </div>
      </div>
    </TabsContent>
  </Tabs>
</template>
