<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { ConfigProvider, theme as antdTheme } from 'ant-design-vue'
import { useSettingsStore } from '@/stores/settings-store'

const settings = useSettingsStore()

const themeConfig = computed(() => ({
  algorithm: settings.isDark.value
    ? antdTheme.darkAlgorithm
    : antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: settings.primaryColor.value,
    borderRadius: 10
  }
}))

watchEffect(() => {
  const mode = settings.isDark.value ? 'dark' : 'light'
  document.documentElement.dataset.theme = mode
})
</script>

<template>
  <ConfigProvider :theme="themeConfig">
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component"></component>
      </transition>
    </router-view>
  </ConfigProvider>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
