import { computed } from 'vue'
import { useMediaQuery, useStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'auto'

const themeMode = useStorage<ThemeMode>('grove:theme-mode', 'auto')
const primaryColor = useStorage('grove:primary-color', '#2196f3')
const showLive2d = useStorage('grove:show-live2d', true)
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

const isDark = computed(() => {
  if (themeMode.value === 'auto') return prefersDark.value
  return themeMode.value === 'dark'
})

function toggleTheme() {
  themeMode.value = isDark.value ? 'light' : 'dark'
}

export function useSettingsStore() {
  return {
    themeMode,
    primaryColor,
    showLive2d,
    isDark,
    toggleTheme
  }
}
