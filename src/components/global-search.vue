<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Empty, Input, Modal, Tag } from 'ant-design-vue'
import { usePlanStore } from '@/stores/plan-store'
import { useLifeStore } from '@/stores/life-store'
import { toDateKey } from '@/utils/stats'
import { toPlainText } from '@/utils/sanitize'
const router = useRouter()
const { plans, fetchPlans } = usePlanStore()
const { records, fetchRecords } = useLifeStore()

const visible = ref(false)
const keyword = ref('')
const inputRef = ref<{ focus: () => void } | null>(null)

const normalized = computed(() => keyword.value.trim().toLowerCase())

const planResults = computed(() => {
  if (!normalized.value) return []
  return plans.value
    .filter((item) =>
      [item.title, item.description, item.remark]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(normalized.value))
    )
    .slice(0, 6)
})

const recordResults = computed(() => {
  if (!normalized.value) return []
  return records.value
    .filter((item) => {
      const text = `${item.title} ${toPlainText(item.content)} ${item.life_date}`
      return text.toLowerCase().includes(normalized.value)
    })
    .slice(0, 6)
})

const hasResult = computed(
  () => planResults.value.length > 0 || recordResults.value.length > 0
)

function open() {
  visible.value = true
  keyword.value = ''
  void fetchPlans()
  void fetchRecords()
  nextTick(() => inputRef.value?.focus())
}

function gotoPlan(id: number, startDate: string) {
  visible.value = false
  router.push({ name: 'Home', query: { date: toDateKey(startDate), focus: String(id) } })
}

function gotoRecord(id: number) {
  visible.value = false
  router.push({ name: 'Life', query: { id: String(id) } })
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

defineExpose({ open })
</script>

<template>
  <Modal
    v-model:open="visible"
    title="搜索"
    :footer="null"
    :width="560"
    :destroy-on-close="false"
  >
    <Input
      ref="inputRef"
      v-model:value="keyword"
      size="large"
      placeholder="搜索任务标题、描述、备注或日志内容（Ctrl / ⌘ + K）"
      allow-clear
    />

    <div class="mt-16 max-h-380 overflow-y-auto">
      <template v-if="hasResult">
        <div
          v-if="planResults.length"
          class="mb-6 text-12px"
          style="color: var(--text-secondary)"
        >
          任务
        </div>
        <div
          v-for="item in planResults"
          :key="`plan-${item.id}`"
          class="result-row flex items-center gap-10 px-10 py-10 rounded-8 cursor-pointer"
          @click="gotoPlan(item.id, item.start_date)"
        >
          <i-mdi-checkbox-marked-circle
            v-if="item.is_completed"
            class="w-18 h-18 flex-shrink-0"
            style="color: #52c41a"
          />
          <i-mdi-circle-outline
            v-else
            class="w-18 h-18 flex-shrink-0"
            style="color: var(--text-secondary)"
          />
          <span class="flex-1 truncate">{{ item.title }}</span>
          <Tag>{{ toDateKey(item.start_date) }}</Tag>
        </div>

        <div
          v-if="recordResults.length"
          class="mt-10 mb-6 text-12px"
          style="color: var(--text-secondary)"
        >
          生活日志
        </div>
        <div
          v-for="item in recordResults"
          :key="`record-${item.id}`"
          class="result-row flex items-center gap-10 px-10 py-10 rounded-8 cursor-pointer"
          @click="gotoRecord(item.id)"
        >
          <i-mdi-notebook-outline
            class="w-18 h-18 flex-shrink-0"
            style="color: #2196f3"
          />
          <span class="flex-1 truncate">{{ item.title }}</span>
          <span class="text-12px" style="color: var(--text-secondary)">
            {{ toDateKey(item.life_date) }}
          </span>
        </div>
      </template>

      <Empty
        v-else-if="normalized"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="没有找到相关内容"
      />

      <div
        v-else
        class="py-24 text-center text-12px"
        style="color: var(--text-secondary)"
      >
        输入关键词开始搜索，回车前可先输入标题片段
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.result-row:hover {
  background: var(--surface-soft);
}
</style>
