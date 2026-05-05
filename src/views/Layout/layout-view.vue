<script setup lang="ts">
import { Layout, LayoutContent } from 'ant-design-vue'
import Aside from '@/views/Layout/components/layout-aside.vue'
import { wlLive2d } from 'wl-live2d'
import type { DLive2dOptions, DTips } from 'wl-live2d'

onMounted(async () => {
  wlLive2d({
    models: [
      {
        path: '/live2d/Hiyori/Hiyori.model3.json',
        position: { x: 0, y: 0 }
      }
    ],
    tips: [
      {
        message: [
          {
            type: 'seasons',
            date: '01/12',
            text: '<span>元旦</span>了呢，新的一年又开始了，今年是2026年～'
          }
        ]
      }
    ] as unknown as DTips[],
    menus: ['home', 'switchTexture', 'capture']
  } as unknown as DLive2dOptions)
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

<style>
#live2dMessageBox-content {
  background-color: #ff95bc;
  color: white;
  padding: 10px;
  height: fit-content;
  border-radius: 0.7em;
  word-break: break-all;
  border-right: 1px solid transparent;
}

.live2dMessageBox-content-hidden {
  opacity: 0;
  transform: scaleY(0.2);
  transition: all 0.35s ease-in;
  -moz-transition: all 0.35s ease-in;
  -webkit-transition: all 0.35s ease-in;
}

.live2dMessageBox-content-visible {
  opacity: 1;
  transition: all 0.35s ease-out;
  -moz-transition: all 0.35s ease-out;
  -webkit-transition: all 0.35s ease-out;
}
</style>
