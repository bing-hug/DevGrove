<script setup lang="ts">
import { Button } from 'ant-design-vue'

withDefaults(
  defineProps<{
    icon: string
    title: string
    buttonText: string
  }>(),
  {
    title: '开心每一天',
    buttonText: '添加任务'
  }
)

const emits = defineEmits<{
  (e: 'buttonClick'): void
}>()
</script>

<template>
  <header
    class="home-header flex justify-between items-center bg-white p-16 rounded-10">
    <div class="home-header-title flex gap-20 items-center leading-48">
      <img :src="icon" alt="开心" class="h-48" />
      <div class="font-24 font-bold theme-color">{{ title }}</div>
    </div>
    <Button type="primary" @click="emits('buttonClick')">{{
      buttonText
    }}</Button>
  </header>
</template>

<style scoped lang="scss">
.home-header {
  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 8px;
}
</style>
