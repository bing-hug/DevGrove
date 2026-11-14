<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from 'ant-design-vue'

const router = useRouter()
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center gap-16 p-40">
    <i-mdi-map-marker-question-outline
      class="w-80 h-80"
      style="color: var(--text-secondary)"
    />
    <div class="text-24px font-bold">页面走丢了</div>
    <div class="text-13px" style="color: var(--text-secondary)">
      链接可能已经失效，回到首页继续记录吧
    </div>
    <Button type="primary" @click="router.push({ name: 'Home' })">
      回到首页
    </Button>
  </div>
</template>
