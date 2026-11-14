<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Card, Progress, Tag } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import MainHeader from '@/components/main-header.vue'
import { usePlanStore } from '@/stores/plan-store'
import { useLifeStore } from '@/stores/life-store'
import { dayStats, groupByDate, toDateKey } from '@/utils/stats'
import { getSingleMood } from '@/enums'

const router = useRouter()
const planStore = usePlanStore()
const lifeStore = useLifeStore()

const cursor = ref(dayjs().startOf('month'))

const groups = computed(() => groupByDate(planStore.plans.value))

const moodByDay = computed(() => {
  const map: Record<string, string> = {}
  for (const record of lifeStore.records.value) {
    const key = toDateKey(record.life_date)
    if (!map[key]) map[key] = record.mood
  }
  return map
})

const diaryByDay = computed(() => {
  const map: Record<string, number> = {}
  for (const record of lifeStore.records.value) {
    const key = toDateKey(record.life_date)
    map[key] = (map[key] || 0) + 1
  }
  return map
})

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const gridStart = computed(() => {
  const first = cursor.value.startOf('month')
  return first.subtract((first.day() + 6) % 7, 'day')
})

const weeks = computed(() => {
  const cells = Array.from({ length: 42 }, (_, index) =>
    gridStart.value.add(index, 'day')
  )
  return Array.from({ length: 6 }, (_, week) =>
    cells.slice(week * 7, week * 7 + 7)
  )
})

const monthStat = computed(() => {
  const prefix = cursor.value.format('YYYY-MM')
  const list = planStore.plans.value.filter((item) =>
    toDateKey(item.start_date).startsWith(prefix)
  )
  return dayStats(list)
})

const monthLabel = computed(() => cursor.value.format('YYYY 年 MM 月'))

function statOf(day: Dayjs) {
  return dayStats(groups.value[day.format('YYYY-MM-DD')])
}

function moodOf(day: Dayjs) {
  return getSingleMood(moodByDay.value[day.format('YYYY-MM-DD')] || '')
}

function diaryOf(day: Dayjs) {
  return diaryByDay.value[day.format('YYYY-MM-DD')] || 0
}

function isToday(day: Dayjs) {
  return day.isSame(dayjs(), 'day')
}

function isCurrentMonth(day: Dayjs) {
  return day.month() === cursor.value.month()
}

function shiftMonth(offset: number) {
  cursor.value = cursor.value.add(offset, 'month').startOf('month')
}

function goToday() {
  cursor.value = dayjs().startOf('month')
}

function goDay(day: Dayjs) {
  router.push({ name: 'Home', query: { date: day.format('YYYY-MM-DD') } })
}

onMounted(async () => {
  await Promise.all([planStore.fetchPlans(), lifeStore.fetchRecords()])
})
</script>

<template>
  <div class="flex flex-col gap-16">
    <MainHeader title="日历" subtitle="按月回看每一天的完成度与心情">
      <template #extra>
        <div class="flex items-center gap-8">
          <Button size="small" @click="shiftMonth(-1)">
            <i-mdi-chevron-left class="w-18 h-18" />
          </Button>
          <Button size="small" @click="goToday">今天</Button>
          <Button size="small" @click="shiftMonth(1)">
            <i-mdi-chevron-right class="w-18 h-18" />
          </Button>
        </div>
      </template>
    </MainHeader>

    <Card :bordered="false" class="calendar-card">
      <template #title>
        <div class="flex items-center justify-between gap-8 flex-wrap">
          <div class="flex items-center gap-8">
            <i-mdi-calendar-month class="w-20 h-20" />
            <span>{{ monthLabel }}</span>
          </div>
          <div class="flex items-center gap-8">
            <Tag>任务 {{ monthStat.done }}/{{ monthStat.total }}</Tag>
            <Tag color="blue">完成率 {{ monthStat.rate }}%</Tag>
          </div>
        </div>
      </template>

      <div class="grid gap-6 mb-6" style="grid-template-columns: repeat(7, 1fr)">
        <div
          v-for="label in weekdays"
          :key="label"
          class="text-center text-12px py-4"
          style="color: var(--text-secondary)"
        >
          周{{ label }}
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div
          v-for="(week, index) in weeks"
          :key="index"
          class="grid gap-6"
          style="grid-template-columns: repeat(7, 1fr)"
        >
          <button
            v-for="day in week"
            :key="day.format('YYYY-MM-DD')"
            class="cal-cell p-8 rounded-8 text-left"
            :class="{
              'is-out': !isCurrentMonth(day),
              'is-today': isToday(day)
            }"
            style="border: 1px solid var(--border-color); background: var(--surface)"
            @click="goDay(day)"
          >
            <div class="flex items-center justify-between">
              <span class="text-12px font-semibold">{{ day.date() }}</span>
              <span v-if="moodOf(day)" class="text-12px">
                {{ moodOf(day)?.emoji }}
              </span>
            </div>

            <div class="mt-4 flex items-center gap-4" style="min-height: 20px">
              <Progress
                v-if="statOf(day).total"
                type="circle"
                :percent="statOf(day).rate"
                :size="18"
                :stroke-width="3"
                :show-info="false"
              />
              <span
                v-if="statOf(day).total"
                class="text-11px"
                style="color: var(--text-secondary)"
              >
                {{ statOf(day).done }}/{{ statOf(day).total }}
              </span>
              <span v-if="diaryOf(day)" class="text-11px">
                📖{{ diaryOf(day) }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div class="mt-12 flex items-center gap-12 flex-wrap text-12px" style="color: var(--text-secondary)">
        <span>圆环：当日任务完成率</span>
        <span>😀：当日心情</span>
        <span>📖：日志篇数</span>
        <span>点击格子进入当天任务</span>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.calendar-card {
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.cal-cell {
  transition: background 0.2s ease;
}

.cal-cell:hover {
  background: var(--surface-soft) !important;
}

.cal-cell.is-out {
  opacity: 0.45;
}

.cal-cell.is-today {
  border-color: #2196f3 !important;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.15);
}
</style>
