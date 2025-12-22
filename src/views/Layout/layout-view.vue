<script setup lang="ts">
import { Layout, LayoutContent } from 'ant-design-vue'
import Aside from '@/views/Layout/components/layout-aside.vue'
</script>

<template>
  <layout :hasSider="true" class="h-full bg-transparent">
    <div
      class="pr-8 border-r-1 border-r-solid border-r-[#0505050f] bg-transparent">
      <Aside></Aside>
    </div>
    <layout-content class="px-40 py-32">
      <router-view v-slot="{ Component }">
        <transition>
          <component :is="Component"></component>
        </transition>
      </router-view>
    </layout-content>
  </layout>
</template>

<style scoped lang="scss"></style>
