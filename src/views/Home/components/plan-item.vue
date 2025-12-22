<script setup lang="ts">
import type { PlanItemInfo } from '@/views/Home/type'
import { priorityEnum } from '@/enums'
import { Tag, Button } from 'ant-design-vue'

const props = defineProps<{
  planItem: PlanItemInfo
}>()

const priorityInfo = computed(() => {
  return (
    priorityEnum.find((item) => item.value === props.planItem.priority) || {}
  )
})

const buttonStyle = computed(() => {
  if (!props.planItem.isCompleted) {
    return {
      backgroundColor: 'rgb(82, 196, 26)',
      borderColor: 'rgb(82, 196, 26)',
      color: 'rgb(255, 255, 255)',
      boxShadow: 'rgba(111, 207, 151, 0.5) 0px 2px 4px'
    }
  }
  return {
    backgroundColor: 'rgb(24, 144, 255)',
    borderColor: 'rgb(24, 144, 255)',
    color: 'rgb(255, 255, 255)',
    boxShadow: 'rgba(24, 144, 255, 0.5) 0px 2px 4px'
  }
})
</script>

<template>
  <div class="content p-16">
    <div class="header flex items-center gap-10 mb-10">
      <img :src="priorityInfo.icon" :alt="priorityInfo.label" class="w-24" />
      <div class="title">{{ planItem.title }}</div>
      <Tag :color="priorityInfo.color">
        <span class="py-5">
          {{ priorityInfo.label || '无' }}
        </span>
      </Tag>

      <Tag :color="planItem.isCompleted ? 'success' : 'processing'">
        <span class="py-5">{{
          planItem.isCompleted ? '已完成' : '未完成'
        }}</span>
      </Tag>
    </div>

    <div class="main flex gap-50 items-center justify-between ml-26">
      <div class="info flex-1">
        <div
          class="description min-h-80 px-12 py-8 color-white"
          :style="{ backgroundColor: priorityInfo.color }">
          {{ planItem.description || '无' }}
        </div>
        <div class="remark">
          {{ planItem.remark || '无' }}
        </div>
      </div>
      <div class="action flex gap-10">
        <Button
          type="primary"
          class="rounded-6 py-4 px-12 h-32"
          :style="buttonStyle">
          {{ planItem.isCompleted ? '回滚' : '完成' }}
        </Button>

        <Button type="text"> 删除 </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  box-shadow: rgba(0, 0, 0, 0.02) 0 2px 8px;
}
:deep(.ant-tag) {
  height: 24px;
  line-height: 22px;
}
</style>
