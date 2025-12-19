<script setup lang="ts">
import { Menu } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import type { MenuProps, ItemType } from 'ant-design-vue'
import { Icon } from '@iconify/vue'

const router = useRouter()

const selectedKeys = ref<string[]>(['Home'])
const openKeys = ref<string[]>(['Home'])

const asideMenu = computed((): ItemType[] => {
  const menus = router.options.routes[0]?.children || []
  return menus.map((item) => ({
    label: h('span', item.meta?.title || '未知'),
    key: item.name as string,
    icon: item.meta?.icon ? h(Icon, { icon: `${item.meta.icon}` }) : null,
    title: item.meta?.title
  })) as ItemType[]
})

const handleClick: MenuProps['onClick'] = (e) => {
  if (e.key) {
    router.push({ name: e.key as string })
  }
}
</script>

<template>
  <div class="aside-container h-full">
    <div
      class="logo px-16 py-12 leading-22 text-left border-b-solid border-b-[#0505050f] border-b-1">
      <img src="@/assets/logo.svg" class="w-32 h-32" />
      <text class="logo-text">测试树</text>
    </div>
    <div>
      <Menu
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        style="width: 256px; border: none"
        mode="inline"
        :items="asideMenu"
        @click="handleClick"></Menu>
    </div>
  </div>
</template>

<style scoped lang="scss">
.logo-text {
  display: inline-block;
  height: 22px;
  margin-block: 0;
  margin-inline-end: 0;
  margin-inline-start: 6px;
  color: rgba(0, 0, 0, 0.88);
  animation-name: antBadgeLoadingCircle;
  animation-duration: 0.4s;
  animation-timing-function: ease;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  vertical-align: middle;
}
</style>
