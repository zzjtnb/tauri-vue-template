import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

export function useMediaQuery(query: string, initialValue = false) {
  const matches = shallowRef(initialValue)
  let mediaQuery: MediaQueryList | undefined

  function update(event?: MediaQueryListEvent): void {
    matches.value = event?.matches ?? mediaQuery?.matches ?? initialValue
  }

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    mediaQuery = window.matchMedia(query)
    update()
    mediaQuery.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', update)
  })

  return matches
}
