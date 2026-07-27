import type { Ref, ComputedRef } from 'vue'

export type ThemeId = 'dark' | 'light'

export interface UseThemeReturn {
  theme: Readonly<Ref<ThemeId>>
  toggleTheme: () => void
  setTheme: (id: ThemeId) => void
  isDark: ComputedRef<boolean>
}

export interface ThemeMeta {
  id: ThemeId
  labelKey: string
  icon: string
}
