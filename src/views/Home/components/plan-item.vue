<script setup lang="ts">
import type { PlanItemInfo } from '@/views/Home/type'
import { priorityEnum } from '@/enums'
import { Tag, Button, Input, message } from 'ant-design-vue'
import { setPlanStatusApi, deletePlanApi, updatePlanRemarkApi } from '@/apis'
import { debounce } from 'lodash'

const props = defineProps<{
  planItem: PlanItemInfo
}>()

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

const remark = ref(props.planItem.remark)

const priorityInfo = computed(() => {
  return (
    priorityEnum.find((item) => item.value === props.planItem.priority) || {
      label: '无',
      color: 'default',
      icon: ''
    }
  )
})

/**
 * 切换任务状态
 */
async function togglePlanStatus() {
  const res = await setPlanStatusApi({
    id: props.planItem.id,
    is_completed: !props.planItem.is_completed
  })
  if (res.success) {
    emits('refresh')
  }
}

async function deletePlan() {
  try {
    const res = await deletePlanApi(props.planItem.id)
    if (res.success) {
      emits('refresh')
    }
  } catch (err) {
    console.error(err)
  }
}

const debounceUpdateRemark = debounce(async () => {
  try {
    const res = await updatePlanRemarkApi({
      id: props.planItem.id,
      remark: remark.value
    })
    if (res.success) {
      message.success('更新备注成功')
    }
  } catch (error) {
    console.log('更新备注失败', error)
  }
}, 1000)

async function handleRemarkChange() {
  debounceUpdateRemark()
}

const buttonStyle = computed(() => {
  if (!props.planItem.is_completed) {
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

      <Tag :color="planItem.is_completed ? 'success' : 'processing'">
        <span class="py-5">{{
          planItem.is_completed ? '已完成' : '未完成'
        }}</span>
      </Tag>
    </div>

    <div class="main flex gap-50 items-center justify-between ml-26">
      <div class="info flex-1">
        <div
          class="description min-h-80 px-12 py-8 color-white"
          :style="{ backgroundColor: priorityInfo?.color }">
          {{ planItem.description || '无' }}
        </div>
        <div class="remark mt-10">
          <Input
            v-model:value="remark"
            placeholder="请输入备注（可选）"
            @change="handleRemarkChange" />
        </div>
      </div>
      <div class="action flex gap-10">
        <Button
          type="primary"
          class="rounded-6 py-4 px-12 h-32"
          :style="buttonStyle"
          @click="togglePlanStatus">
          {{ planItem.is_completed ? '回滚' : '完成' }}
        </Button>

        <Button type="text" @click="deletePlan"> 删除 </Button>
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
