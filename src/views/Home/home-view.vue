<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Progress,
  Spin,
  Tag,
  message
} from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import CreateTask from '@/views/Home/components/create-task.vue'
import PlanItemCard from '@/views/Home/components/plan-item.vue'
import MainHeader from '@/components/main-header.vue'
import happyIcon from '@/assets/happy.svg'
import { createPlanApi, setPlanStatusApi } from '@/apis/plan'
import { usePlanStore } from '@/stores/plan-store'
import { useKnowledgeStore } from '@/stores/knowledge-store'
import { useInterviewStore } from '@/stores/interview-store'
import { writebackSourceDone } from '@/composables/use-source-sync'
import { defaultTaskList } from '@/views/Home/type'
import { toDateKey } from '@/utils/stats'
import type { PlanItem, PlanSourceType } from '@/types'

const route = useRoute()
const planStore = usePlanStore()
const knowledgeStore = useKnowledgeStore()
const interviewStore = useInterviewStore()

const SEED_FLAG = 'grove:seeded'
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const pickerDate = ref<Dayjs | undefined>(dayjs())
const seedLoading = ref(false)
const completing = ref(false)

const createTaskRef = ref<{ openModal: (item?: PlanItem) => void } | null>(
  null
)

const dayList = computed(() => planStore.plansOf(selectedDate.value))
const pending = computed(() => dayList.value.filter((item) => !item.is_completed))
const finished = computed(() => dayList.value.filter((item) => item.is_completed))
const overdue = computed(() => planStore.overduePlans())
const progress = computed(() =>
  dayList.value.length
    ? Math.round((finished.value.length / dayList.value.length) * 100)
    : 0
)

const todayLabel = computed(() =>
  dayjs(selectedDate.value).isSame(dayjs(), 'day')
    ? '今天'
    : dayjs(selectedDate.value).format('MM 月 DD 日')
)

/* ---------------- 复习 → 任务闭环 ---------------- */

interface ReviewEntry {
  key: string
  sourceType: PlanSourceType
  sourceId: string
  title: string
  reasonText: string
  remark: string
}

/** 今日复习清单：未掌握的知识树叶子 + 到期面试题 */
const reviewList = computed<ReviewEntry[]>(() => {
  const knowledge = knowledgeStore.dueNodes().map((node) => ({
    key: `knowledge:${node.id}`,
    sourceType: 'knowledge' as const,
    sourceId: node.id,
    title: node.title,
    reasonText: '未掌握',
    remark: `来源：知识树 · ${node.pathText}`
  }))
  const interview = interviewStore.dueQuestions().map((q) => ({
    key: `interview:${q.id}`,
    sourceType: 'interview' as const,
    sourceId: q.id,
    title: q.title,
    reasonText: `到期日 ${q.nextReview}`,
    remark: `来源：面试题 · ${q.tags.join(' / ') || '未打标签'}`
  }))
  return [...knowledge, ...interview]
})

/**
 * 去重键：当天已存在「同 source_type + source_id」的计划即视为已加入。
 * 直接读 planStore 全量数据（后端为准），刷新后依然生效。
 * 注意：当前后端 GET /plans 暂未回传 source_type/source_id（已记入审计 B-005），
 * 因此这里再并上一个「本次会话内成功加入」的乐观集合，保证点击后按钮立即置灰、
 * 路由切换不重置；待后端列表回传来源字段后即以后端数据为准。
 */
const joinedLocally = ref(new Set<string>())

const joinedSourceKeys = computed(() => {
  const todayKey = dayjs().format('YYYY-MM-DD')
  const set = new Set<string>(joinedLocally.value)
  for (const plan of planStore.plans.value) {
    if (!plan.source_type || !plan.source_id) continue
    if (toDateKey(plan.start_date) !== todayKey) continue
    set.add(`${plan.source_type}:${plan.source_id}`)
  }
  return set
})

const joining = ref(false)

async function joinToToday(entry: ReviewEntry) {
  if (joining.value) return
  joining.value = true
  try {
    await createPlanApi({
      title: entry.title,
      description: '',
      start_date: dayjs().format('YYYY-MM-DD'),
      priority: 'MEDIUM',
      remark: entry.remark,
      is_completed: false,
      source_type: entry.sourceType,
      source_id: entry.sourceId
    })
    joinedLocally.value = new Set(joinedLocally.value).add(entry.key)
    message.success('已加入今日任务')
    await refresh()
  } catch {
    // 失败提示由请求拦截器统一处理
  } finally {
    joining.value = false
  }
}

function handleDateChange(value: string | Dayjs | null) {
  const date = value ? dayjs(value) : dayjs()
  pickerDate.value = date
  selectedDate.value = date.format('YYYY-MM-DD')
}

function openCreateTask() {
  createTaskRef.value?.openModal()
}

function openEditTask(item: PlanItem) {
  createTaskRef.value?.openModal(item)
}

async function refresh() {
  await planStore.fetchPlans(true)
}

/** 首次使用：仅在完全没有任务时写入一次示例数据 */
async function seedIfEmpty() {
  if (planStore.plans.value.length > 0) return
  if (localStorage.getItem(SEED_FLAG)) return
  // 没成功拉到数据（后端不可用 / 首次请求还在路上）时不播种，避免重复写入示例任务
  if (!planStore.loaded.value) return

  seedLoading.value = true
  try {
    for (const item of defaultTaskList) {
      await createPlanApi({
        ...item,
        start_date: dayjs().format('YYYY-MM-DD')
      })
    }
    localStorage.setItem(SEED_FLAG, '1')
    await planStore.fetchPlans(true)
  } catch {
    // 失败提示由请求拦截器统一处理
  } finally {
    seedLoading.value = false
  }
}

function viewEarliestOverdue() {
  const first = overdue.value[0]
  if (first) {
    selectedDate.value = toDateKey(first.start_date)
    pickerDate.value = dayjs(first.start_date)
  }
}

async function completeAll() {
  if (completing.value) return
  completing.value = true
  try {
    await Promise.all(
      pending.value.map((item) =>
        setPlanStatusApi({ id: item.id, is_completed: true })
      )
    )
    // 批量勾选完成同样回写来源状态
    pending.value.forEach((item) => writebackSourceDone(item))
    message.success('今日任务已全部完成')
    await refresh()
  } catch {
    // 失败提示由请求拦截器统一处理
  } finally {
    completing.value = false
  }
}

onMounted(async () => {
  await planStore.fetchPlans(true)
  await seedIfEmpty()

  const dateFromQuery = route.query.date
  if (typeof dateFromQuery === 'string' && dayjs(dateFromQuery).isValid()) {
    selectedDate.value = dayjs(dateFromQuery).format('YYYY-MM-DD')
    pickerDate.value = dayjs(dateFromQuery)
  }
})

watch(
  () => route.query.date,
  (value) => {
    if (typeof value === 'string' && dayjs(value).isValid()) {
      selectedDate.value = dayjs(value).format('YYYY-MM-DD')
      pickerDate.value = dayjs(value)
    }
  }
)
</script>

<template>
  <div class="flex flex-col gap-16">
    <MainHeader
      :icon="happyIcon"
      title="开心每一天"
      :subtitle="`${todayLabel} · 共 ${dayList.length} 件事`"
      button-text="添加任务"
      @button-click="openCreateTask"
    >
      <template #extra>
        <div v-if="dayList.length" class="flex items-center gap-8">
          <Progress
            type="circle"
            :percent="progress"
            :size="38"
            :stroke-width="6"
          />
          <span class="text-12px" style="color: var(--text-secondary)">
            {{ finished.length }}/{{ dayList.length }}
          </span>
        </div>
      </template>
    </MainHeader>

    <Card
      v-if="overdue.length"
      :bordered="false"
      class="summary-card"
      :body-style="{ padding: '16px' }"
    >
      <div class="flex items-center justify-between flex-wrap gap-8">
        <div class="flex items-center gap-8">
          <i-mdi-alert-circle-outline class="w-20 h-20" style="color: #faad14" />
          <span class="text-14px font-semibold">有 {{ overdue.length }} 件逾期任务</span>
          <span class="text-12px" style="color: var(--text-secondary)">
            从更早的日期顺延下来，记得处理或改期
          </span>
        </div>
        <Button size="small" @click="viewEarliestOverdue">查看最早一条</Button>
      </div>

      <div class="mt-12 flex flex-col gap-10">
        <PlanItemCard
          v-for="item in overdue.slice(0, 3)"
          :key="item.id"
          :plan-item="item"
          show-date
          @refresh="refresh"
          @edit="openEditTask"
        />
      </div>
    </Card>

    <Card :bordered="false" class="summary-card">
      <template #title>
        <div class="flex items-center justify-between gap-10 flex-wrap">
          <div class="flex items-center gap-8">
            <i-mdi-calendar-month class="w-20 h-20" />
            <span>{{ selectedDate }} 的任务</span>
            <Tag v-if="dayjs(selectedDate).isSame(dayjs(), 'day')" color="blue">
              今天
            </Tag>
          </div>

          <div class="flex items-center gap-8">
            <DatePicker
              v-model:value="pickerDate"
              :allow-clear="false"
              placeholder="选择日期"
              @change="handleDateChange"
            />
          <Button
            v-if="pending.length"
            size="small"
            :loading="completing"
            @click="completeAll"
          >
            全部完成
          </Button>
          </div>
        </div>
      </template>

      <Spin :spinning="planStore.loading.value || seedLoading">
        <div v-if="dayList.length" class="flex flex-col gap-16">
          <section v-if="pending.length">
            <div
              class="mb-8 text-12px"
              style="color: var(--text-secondary)"
            >
              待完成 {{ pending.length }}
            </div>
            <div class="flex flex-col gap-10">
              <PlanItemCard
                v-for="item in pending"
                :key="item.id"
                :plan-item="item"
                @refresh="refresh"
                @edit="openEditTask"
              />
            </div>
          </section>

          <section v-if="finished.length">
            <div
              class="mb-8 text-12px"
              style="color: var(--text-secondary)"
            >
              已完成 {{ finished.length }}
            </div>
            <div class="flex flex-col gap-10">
              <PlanItemCard
                v-for="item in finished"
                :key="item.id"
                :plan-item="item"
                @refresh="refresh"
                @edit="openEditTask"
              />
            </div>
          </section>
        </div>

        <Empty
          v-else-if="!planStore.loading.value"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="这一天还没有安排，先加一件小事吧～"
        >
          <Button type="primary" @click="openCreateTask">添加任务</Button>
        </Empty>

        <!-- 今日复习：不挂在 dayList.length 门控下，今日 0 任务时也要可见 -->
        <section class="mt-16">
          <div
            class="mb-8 text-12px"
            style="color: var(--text-secondary)"
          >
            今日复习
          </div>
          <div v-if="reviewList.length" class="flex flex-col gap-10">
            <div
              v-for="entry in reviewList"
              :key="entry.key"
              class="px-12 py-10 rounded-8 flex items-center gap-10 flex-wrap"
              style="background: var(--surface-soft); border: 1px solid var(--border-color)"
            >
              <Tag :color="entry.sourceType === 'knowledge' ? 'purple' : 'geekblue'">
                {{ entry.sourceType === 'knowledge' ? '知识树' : '面试题' }}
              </Tag>
              <span class="text-14px font-semibold flex-1 min-w-120">{{ entry.title }}</span>
              <span class="text-12px" style="color: var(--text-secondary)">
                {{ entry.reasonText }}
              </span>
              <Button
                size="small"
                :disabled="joinedSourceKeys.has(entry.key)"
                :loading="joining && !joinedSourceKeys.has(entry.key)"
                @click="joinToToday(entry)"
              >
                {{ joinedSourceKeys.has(entry.key) ? '已加入' : '加入今日任务' }}
              </Button>
            </div>
          </div>
          <div v-else class="text-12px" style="color: var(--text-secondary)">
            今天没有需要复习的内容，休息一下
          </div>
        </section>
      </Spin>
    </Card>

    <CreateTask ref="createTaskRef" @refresh="refresh" />
  </div>
</template>

<style scoped>
.summary-card {
  background: var(--surface);
  box-shadow: var(--shadow-card);
}
</style>
