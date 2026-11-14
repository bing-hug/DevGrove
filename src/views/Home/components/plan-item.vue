<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button, Input, Popconfirm, Tag, message } from 'ant-design-vue'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { priorityEnum } from '@/enums'
import {
  deletePlanApi,
  setPlanStatusApi,
  updatePlanRemarkApi
} from '@/apis/plan'
import { companionSay } from '@/composables/use-companion'
import { writebackSourceDone } from '@/composables/use-source-sync'
import { toDateKey } from '@/utils/stats'
import type { PlanItem } from '@/types'

const props = defineProps<{
  planItem: PlanItem
  showDate?: boolean
}>()

const emits = defineEmits<{
  (e: 'refresh'): void
  (e: 'edit', item: PlanItem): void
}>()

const remark = ref(props.planItem.remark)
const toggling = ref(false)
const deleting = ref(false)

const priorityInfo = computed(
  () =>
    priorityEnum.find((item) => item.value === props.planItem.priority) || {
      label: '无',
      color: '#9e9e9e',
      icon: ''
    }
)

const isOverdue = computed(
  () =>
    !props.planItem.is_completed &&
    dayjs(props.planItem.start_date).isBefore(dayjs(), 'day')
)

/** 切换任务状态 */
async function togglePlanStatus() {
  if (toggling.value) return
  toggling.value = true
  try {
    const next = !props.planItem.is_completed
    const res = await setPlanStatusApi({
      id: props.planItem.id,
      is_completed: next
    })
    if (res.success) {
      // 勾选完成（非回滚）时回写来源状态；回滚不回退掌握度/复习进度
      if (next) writebackSourceDone(props.planItem)
      if (next) companionSay('完成啦，真棒！')
      emits('refresh')
    }
  } catch {
    // 失败提示由请求拦截器统一处理
  } finally {
    toggling.value = false
  }
}

async function deletePlan() {
  deleting.value = true
  try {
    const res = await deletePlanApi(props.planItem.id)
    if (res.success) {
      message.success('已删除')
      emits('refresh')
    }
  } catch {
    // 失败提示由请求拦截器统一处理
  } finally {
    deleting.value = false
  }
}

const debounceUpdateRemark = debounce(async () => {
  try {
    const res = await updatePlanRemarkApi({
      id: props.planItem.id,
      remark: remark.value
    })
    if (res.success) {
      message.success('备注已保存')
    }
  } catch {
    // 失败提示由请求拦截器统一处理
  }
}, 1000)

function handleRemarkChange() {
  debounceUpdateRemark()
}

onBeforeUnmount(() => {
  debounceUpdateRemark.cancel()
})

const actionStyle = computed(() => {
  if (!props.planItem.is_completed) {
    return {
      backgroundColor: 'rgb(82, 196, 26)',
      borderColor: 'rgb(82, 196, 26)',
      color: '#fff'
    }
  }
  return {
    backgroundColor: 'rgb(24, 144, 255)',
    borderColor: 'rgb(24, 144, 255)',
    color: '#fff'
  }
})
</script>

<template>
  <div class="plan-card p-16 rounded-10" style="background: var(--surface-soft)">
    <div class="flex items-center gap-8 mb-10 flex-wrap">
      <img
        v-if="priorityInfo.icon"
        :src="priorityInfo.icon"
        :alt="priorityInfo.label"
        class="w-18 h-18"
      />
      <span class="text-15px font-semibold flex-1 min-w-120">{{ planItem.title }}</span>

      <Tag :color="priorityInfo.color">{{ priorityInfo.label }}</Tag>
      <Tag :color="planItem.is_completed ? 'success' : 'processing'">
        {{ planItem.is_completed ? '已完成' : '未完成' }}
      </Tag>
      <Tag v-if="isOverdue" color="error">已逾期</Tag>
      <Tag v-if="showDate">{{ toDateKey(planItem.start_date) }}</Tag>
    </div>

    <div class="flex gap-16 items-start justify-between">
      <div class="flex-1 min-w-0">
        <div
          class="px-12 py-8 rounded-8 text-13px break-all whitespace-pre-wrap"
          :style="{
            backgroundColor: `${priorityInfo.color}14`,
            color: priorityInfo.color
          }"
        >
          {{ planItem.description || '无' }}
        </div>

        <Input
          v-model:value="remark"
          class="mt-10"
          placeholder="备注（自动保存，可选）"
          @change="handleRemarkChange"
        />
      </div>

      <div class="flex gap-8 flex-shrink-0">
        <Button
          type="primary"
          size="small"
          :loading="toggling"
          :style="actionStyle"
          @click="togglePlanStatus"
        >
          {{ planItem.is_completed ? '回滚' : '完成' }}
        </Button>

        <Button size="small" @click="emits('edit', planItem)">编辑</Button>

        <Popconfirm
          title="确定删除这条任务？"
          ok-text="删除"
          cancel-text="取消"
          @confirm="deletePlan"
        >
          <Button size="small" danger :loading="deleting">删除</Button>
        </Popconfirm>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-card {
  border: 1px solid var(--border-color);
}
</style>
