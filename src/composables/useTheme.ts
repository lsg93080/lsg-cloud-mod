import { ref, computed, readonly } from 'vue'
import type { ThemeId, UseThemeReturn } from '@/types/theme'

// Shared key with Vitrina: same-origin theme stays in sync across microfrontends
const STORAGE_KEY = 'vitrina_theme'
const DEFAULT_THEME: ThemeId = 'dark'

// The theme is stored in localStorage and applied on the document element's dataset
const theme = ref<ThemeId>((localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? DEFAULT_THEME)

function applyTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id
  localStorage.setItem(STORAGE_KEY, id)
}

// Apply on first import
applyTheme(theme.value)

export function useTheme(): UseThemeReturn {
  function setTheme(id: ThemeId): void {
    theme.value = id
    applyTheme(id)
  }

  function toggleTheme(): void {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme: readonly(theme),
    toggleTheme,
    setTheme,
    isDark: computed(() => theme.value === 'dark')
  }
}
