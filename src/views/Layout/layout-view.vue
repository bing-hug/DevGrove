<script setup lang="ts">
import { Layout, LayoutContent } from 'ant-design-vue'
import Aside from '@/views/Layout/components/layout-aside.vue'
import { wlLive2d } from 'wl-live2d'
import type { DLive2dOptions } from 'wl-live2d'

onMounted(() => {
  wlLive2d({
    models: [
      {
        path: 'https://fastly.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json',
        scale: 0.6,
        position: { x: 0, y: 0 }
      }
    ]
  } as DLive2dOptions)
})
</script>

<template>
  <layout :hasSider="true" class="h-full bg-transparent">
    <div
      class="pr-8 border-r-1 border-r-solid border-r-[#0505050f] bg-transparent"
    >
      <Aside></Aside>
    </div>
    <layout-content class="px-40 pt-32">
      <router-view v-slot="{ Component }">
        <transition>
          <component :is="Component"></component>
        </transition>
      </router-view>
    </layout-content>
  </layout>
</template>

<style scoped lang="scss"></style>
