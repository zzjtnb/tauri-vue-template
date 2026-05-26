import type { Ref } from 'vue'
import type { IconCollection } from './collection'
import type { IconPickerValue } from './icon-picker'
import { computed, ref, watch } from 'vue'

interface IconifyCollectionResponse {
  uncategorized?: string[]
  categories?: Record<string, string[]>
  aliases?: Record<string, { parent: string }>
}

interface UseIconPickerOptions {
  collection: Readonly<Ref<IconCollection>>
  modelValue: Readonly<Ref<IconPickerValue>>
  select: (value: IconPickerValue) => void
}

function normalizeIcons(payload: IconifyCollectionResponse): string[] {
  return Array.from(new Set([
    ...Object.values(payload.categories ?? {}).flat(),
    ...(payload.uncategorized ?? []),
    ...Object.keys(payload.aliases ?? {}),
  ])).sort()
}

export function useIconPicker({ collection, modelValue, select }: UseIconPickerOptions) {
  const open = ref(false)
  const keyword = ref('')
  const loading = ref(false)
  const error = ref('')
  const iconNames = ref<string[]>([])
  const svgCache = ref<Record<string, string>>({})
  const pendingSvgKeys = new Set<string>()

  const selectedName = computed(() => modelValue.value.replace(new RegExp(`^i-${collection.value.prefix}-`), ''))
  const selectedIconKey = computed(() => selectedName.value ? iconKey(selectedName.value) : '')
  const filteredIcons = computed(() => {
    const value = keyword.value.trim().toLowerCase()
    if (!value) {
      return iconNames.value
    }

    return iconNames.value.filter(name => name.includes(value))
  })
  const visibleIcons = computed(() => filteredIcons.value.slice(0, 160))

  function iconClass(name: string): IconPickerValue {
    return `i-${collection.value.prefix}-${name}`
  }

  function iconKey(name: string): string {
    return `${collection.value.prefix}:${name}`
  }

  function iconSvg(name: string): string {
    return svgCache.value[iconKey(name)] ?? ''
  }

  function collectionUrl(): string {
    return `${collection.value.apiBase}/${collection.value.prefix}.json?icons=all`
  }

  function iconUrl(name: string): string {
    return `${collection.value.apiBase}/${collection.value.prefix}/${name}.svg?height=24`
  }

  async function loadIcons(): Promise<void> {
    if (iconNames.value.length || loading.value) {
      return
    }

    loading.value = true
    error.value = ''
    try {
      const response = await fetch(collectionUrl())
      if (!response.ok) {
        throw new Error('图标集合加载失败')
      }

      iconNames.value = normalizeIcons(await response.json() as IconifyCollectionResponse)
    }
    catch (cause) {
      error.value = cause instanceof Error ? cause.message : '图标集合加载失败'
    }
    finally {
      loading.value = false
    }
  }

  async function loadSvg(name: string): Promise<void> {
    const key = iconKey(name)
    if (svgCache.value[key] || pendingSvgKeys.has(key)) {
      return
    }

    pendingSvgKeys.add(key)
    try {
      const response = await fetch(iconUrl(name))
      if (!response.ok) {
        return
      }

      svgCache.value = {
        ...svgCache.value,
        [key]: await response.text(),
      }
    }
    catch {
      // 在线预览失败不影响保存图标类。
    }
    finally {
      pendingSvgKeys.delete(key)
    }
  }

  function selectIcon(name: string): void {
    select(iconClass(name))
    open.value = false
  }

  function clearIcon(): void {
    select('')
    keyword.value = ''
  }

  watch(open, (value) => {
    if (value) {
      void loadIcons()
    }
  })

  watch(collection, () => {
    keyword.value = ''
    error.value = ''
    iconNames.value = []
    svgCache.value = {}
    pendingSvgKeys.clear()
    if (open.value) {
      void loadIcons()
    }
  })

  watch(selectedName, (name) => {
    if (name) {
      void loadSvg(name)
    }
  }, { immediate: true })

  watch(visibleIcons, (names) => {
    for (const name of names.slice(0, 80)) {
      void loadSvg(name)
    }
  })

  return {
    open,
    keyword,
    loading,
    error,
    selectedName,
    selectedIconKey,
    filteredIcons,
    visibleIcons,
    svgCache,
    iconSvg,
    selectIcon,
    clearIcon,
  }
}
