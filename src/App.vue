<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
</script>

<template>
  <ConfigProvider
    :theme="{
      token: {
        colorPrimary: '#2196f3'
      }
    }">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component"></component>
      </transition>
    </router-view>
  </ConfigProvider>
</template>
