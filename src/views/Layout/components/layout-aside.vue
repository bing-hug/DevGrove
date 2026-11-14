<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button, Menu, Segmented, Switch } from 'ant-design-vue'
import type { ItemType, MenuProps } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings-store'
import type { ThemeMode } from '@/stores/settings-store'

const router = useRouter()
const route = useRoute()
const settings = useSettingsStore()

const emits = defineEmits<{
  (e: 'navigate'): void
  (e: 'search'): void
}>()

const menuItems = computed<ItemType[]>(() => {
  const children = router.options.routes[0]?.children || []
  return children
    .filter((item) => item.meta?.title)
    .map((item) => ({
      label: h('span', item.meta?.title as string),
      key: item.name as string,
      icon: item.meta?.icon
        ? h(Icon, { icon: item.meta.icon as string })
        : undefined
    })) as ItemType[]
})

const selectedKeys = ref<string[]>([(route.name as string) || 'Home'])

watch(
  () => route.name,
  (name) => {
    selectedKeys.value = [(name as string) || 'Home']
  }
)

const handleClick: MenuProps['onClick'] = (event) => {
  if (event.key) {
    router.push({ name: event.key as string })
    emits('navigate')
  }
}

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '自动', value: 'auto' }
]

const themeMode = computed({
  get: () => settings.themeMode.value as string,
  set: (value: string | number) => {
    settings.themeMode.value = value as ThemeMode
  }
})
</script>

<template>
  <aside class="aside-container h-full flex flex-col">
    <div
      class="logo flex items-center gap-10 px-16 py-14 border-b-1"
      style="border-bottom-style: solid; border-color: var(--border-color)"
    >
      <img src="@/assets/logo.png" class="w-32 h-32" alt="logo" />
      <span class="text-16px font-semibold">成长篇</span>
    </div>

    <div class="px-8 py-8">
      <Button class="w-full" @click="emits('search')">
        <template #icon>
          <i-mdi-magnify class="w-16 h-16" />
        </template>
        <span class="flex items-center justify-between w-full">
          <span>搜索</span>
          <span class="text-12px ml-12" style="color: var(--text-secondary)">Ctrl K</span>
        </span>
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <Menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        class="aside-menu"
        @click="handleClick"
      />
    </div>

    <div
      class="px-16 py-14 border-t-1"
      style="border-top-style: solid; border-color: var(--border-color)"
    >
      <div class="mb-8 text-12px" style="color: var(--text-secondary)">
        外观
      </div>
      <Segmented
        v-model:value="themeMode"
        :options="themeOptions"
        block
        size="small"
      />

      <div class="mt-12 flex items-center justify-between">
        <span class="text-13px">看板娘</span>
        <Switch
          :checked="settings.showLive2d.value"
          size="small"
          @change="(checked) => (settings.showLive2d.value = Boolean(checked))"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.aside-container {
  background: var(--surface);
}

:deep(.aside-menu) {
  background: transparent;
  border: none;
}

:deep(.ant-menu-light) {
  background: transparent;
}
</style>
