<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Drawer, Popconfirm, message } from 'ant-design-vue'
import { deleteLifeRecordApi } from '@/apis/lifeRecord'
import { getSingleMood } from '@/enums'
import { spliceImgUrl } from '@/utils/spliceImgUrl'
import { sanitizeHtml } from '@/utils/sanitize'
import { toDateKey } from '@/utils/stats'
import type { LifeRecordItem } from '@/types'

const props = defineProps<{
  record: LifeRecordItem | null
}>()

const emits = defineEmits<{
  (e: 'refresh'): void
  (e: 'edit', record: LifeRecordItem): void
}>()

const visible = ref(false)
const deleting = ref(false)

const mood = computed(() =>
  props.record ? getSingleMood(props.record.mood) : null
)

const safeContent = computed(() =>
  props.record ? sanitizeHtml(props.record.content) : ''
)

function open() {
  visible.value = true
}

async function handleDelete() {
  if (!props.record) return
  deleting.value = true
  try {
    const res = await deleteLifeRecordApi(props.record.id)
    if (res.success) {
      message.success('日志已删除')
      visible.value = false
      emits('refresh')
    }
  } catch {
    // 失败提示由请求拦截器统一处理
  } finally {
    deleting.value = false
  }
}

function handleEdit() {
  if (!props.record) return
  emits('edit', props.record)
  visible.value = false
}

defineExpose({ open })
</script>

<template>
  <Drawer v-model:open="visible" title="日志详情" placement="right" :width="560">
    <div v-if="record" class="flex flex-col gap-16">
      <img
        v-if="record.cover"
        :src="spliceImgUrl(record.cover)"
        alt="封面"
        class="w-full rounded-10 object-cover"
        style="max-height: 260px"
      />

      <div>
        <div class="text-20px font-bold break-all">{{ record.title }}</div>
        <div class="mt-8 flex items-center gap-12 flex-wrap">
          <span v-if="mood" :style="{ color: mood.color }" class="text-13px">
            {{ mood.emoji }} {{ mood.label }}
          </span>
          <span class="text-12px" style="color: var(--text-secondary)">
            {{ toDateKey(record.life_date) }}
          </span>
        </div>
      </div>

      <div class="rich-text text-14px" v-html="safeContent"></div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-8">
        <Button @click="handleEdit">编辑</Button>
        <Popconfirm
          title="确定删除这篇日志？"
          ok-text="删除"
          cancel-text="取消"
          @confirm="handleDelete"
        >
          <Button danger :loading="deleting">删除</Button>
        </Popconfirm>
      </div>
    </template>
  </Drawer>
</template>
