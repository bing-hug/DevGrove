<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
</script>

<template>
  <ConfigProvider
      :theme="{
        token: {
            'colorPrimary': '#2196f3',
        }
      }"
  >
    <router-view v-slot="{ Component }" >
      <transition>
        <component :is="Component"></component>
      </transition>
    </router-view>
  </ConfigProvider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
