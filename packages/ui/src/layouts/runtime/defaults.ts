import type { Layout } from '../types/public'

export const standardNames = new Set<Layout['Name']>(['topnav', 'sidebar', 'hybrid'])
export const themeColors = ['neutral', 'blue', 'violet', 'teal', 'rose', 'amber'] satisfies Layout['Theme']['Color'][]

function deepFreeze<T extends object>(value: T): T {
  for (const nestedValue of Object.values(value)) {
    if (nestedValue && typeof nestedValue === 'object' && !Object.isFrozen(nestedValue)) {
      deepFreeze(nestedValue)
    }
  }

  Object.freeze(value)
  return value
}

/** 布局默认状态；宿主需要可变副本时必须 structuredClone，避免修改库级常量。 */
export const defaultLayoutState: Layout['State'] = deepFreeze({
  preferences: {
    theme: {
      mode: 'system',
      color: 'blue',
    },
    layoutMode: null,
    navigation: {
      sidebar: {
        collapseMode: 'auto',
        menuMode: 'collapse',
      },
      topnav: {
        menuMode: 'collapse',
      },
    },
    pageElements: {
      tabs: true,
      breadcrumb: true,
      headerFixed: true,
      footerFixed: false,
    },
  },
  ui: {
    settings: {
      open: false,
    },
    sidebar: {
      mode: 'expanded',
    },
  },
})

export function isStandard(name: Layout['Name']): name is Exclude<Layout['Name'], 'blank'> {
  return standardNames.has(name)
}
