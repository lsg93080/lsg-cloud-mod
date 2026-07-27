import { computed } from 'vue'
import { useTheme } from './useTheme'

export function useChartTheme() {
  const { isDark, theme } = useTheme()

  const apexMode = computed<'dark' | 'light'>(() => (isDark.value ? 'dark' : 'light'))

  const textColor = computed(() => {
    // Access theme.value to ensure reactivity even though it's not directly used
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _theme = theme.value
    return getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
  })

  return { apexMode, textColor }
}
