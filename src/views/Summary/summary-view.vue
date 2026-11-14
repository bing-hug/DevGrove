<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Button, Card, Tag, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import MainHeader from '@/components/main-header.vue'
import { usePlanStore } from '@/stores/plan-store'
import { useLifeStore } from '@/stores/life-store'
import {
  MOOD_CATEGORY_LABEL,
  buildAchievements,
  buildHeatmap,
  buildWeeklyReport,
  calcStreak,
  dayStats,
  groupByDate,
  moodCategoryStats,
  overallStats,
  toDateKey,
  weekDays
} from '@/utils/stats'
import { copyText, downloadText } from '@/utils/download'
import type { MoodCategory } from '@/utils/stats'

const planStore = usePlanStore()
const lifeStore = useLifeStore()

const plans = computed(() => planStore.plans.value)
const records = computed(() => lifeStore.records.value)

const totalStat = computed(() => overallStats(plans.value))
const streak = computed(() => calcStreak(plans.value))
const groups = computed(() => groupByDate(plans.value))

const weekStat = computed(() => {
  const days = weekDays().map((day) => day.format('YYYY-MM-DD'))
  const weekPlans = plans.value.filter((plan) =>
    days.includes(toDateKey(plan.start_date))
  )
  return dayStats(weekPlans)
})

const trend = computed(() => {
  const today = dayjs()
  return Array.from({ length: 14 }, (_, index) => {
    const day = today.subtract(13 - index, 'day')
    const stat = dayStats(groups.value[day.format('YYYY-MM-DD')])
    return {
      label: day.format('MM-DD'),
      rate: stat.rate,
      total: stat.total,
      done: stat.done
    }
  })
})

const heatmap = computed(() => buildHeatmap(plans.value, 16))

const heatColors = ['transparent', '#dbeafe', '#a9ccff', '#6ea8ff', '#2196f3']

const moodStats = computed(() => moodCategoryStats(records.value))

const moodRows = computed(() =>
  (Object.keys(MOOD_CATEGORY_LABEL) as MoodCategory[]).map((key) => ({
    key,
    label: MOOD_CATEGORY_LABEL[key],
    count: moodStats.value[key],
    percent: records.value.length
      ? Math.round((moodStats.value[key] / records.value.length) * 100)
      : 0
  }))
)

const achievements = computed(() =>
  buildAchievements(plans.value, records.value)
)

const report = computed(() =>
  buildWeeklyReport(plans.value, records.value)
)

async function copyReport() {
  const ok = await copyText(report.value)
  if (ok) message.success('周报已复制到剪贴板')
  else message.error('复制失败，请手动选择文本')
}

function downloadReport() {
  downloadText(`本周回顾-${dayjs().format('YYYY-MM-DD')}.md`, report.value)
}

onMounted(async () => {
  await Promise.all([planStore.fetchPlans(), lifeStore.fetchRecords()])
})
</script>

<template>
  <div class="flex flex-col gap-16">
    <MainHeader title="数据回顾" subtitle="把已经积累的记录，变成看得见的成长">
      <template #extra>
        <Button size="small" @click="copyReport">复制周报</Button>
        <Button size="small" type="primary" @click="downloadReport">
          下载周报
        </Button>
      </template>
    </MainHeader>

    <div class="grid gap-12" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr))">
      <Card :bordered="false" class="stat-card">
        <div class="text-12px" style="color: var(--text-secondary)">本周完成率</div>
        <div class="mt-6 text-28px font-bold">{{ weekStat.rate }}%</div>
        <div class="mt-4 text-12px" style="color: var(--text-secondary)">
          {{ weekStat.done }} / {{ weekStat.total }} 件
        </div>
      </Card>

      <Card :bordered="false" class="stat-card">
        <div class="text-12px" style="color: var(--text-secondary)">连续达标</div>
        <div class="mt-6 text-28px font-bold">{{ streak }} 天</div>
        <div class="mt-4 text-12px" style="color: var(--text-secondary)">
          当日任务全部完成才算达标
        </div>
      </Card>

      <Card :bordered="false" class="stat-card">
        <div class="text-12px" style="color: var(--text-secondary)">累计完成任务</div>
        <div class="mt-6 text-28px font-bold">{{ totalStat.done }}</div>
        <div class="mt-4 text-12px" style="color: var(--text-secondary)">
          共 {{ totalStat.total }} 件，完成率 {{ totalStat.rate }}%
        </div>
      </Card>

      <Card :bordered="false" class="stat-card">
        <div class="text-12px" style="color: var(--text-secondary)">生活日志</div>
        <div class="mt-6 text-28px font-bold">{{ records.length }} 篇</div>
        <div class="mt-4 text-12px" style="color: var(--text-secondary)">
          记录下来的情绪与片段
        </div>
      </Card>
    </div>

    <Card :bordered="false" class="stat-card" title="近两周完成率">
      <div class="flex items-end gap-8 h-110">
        <div
          v-for="item in trend"
          :key="item.label"
          class="flex-1 flex flex-col items-center justify-end h-full gap-4"
        >
          <span class="text-10px" style="color: var(--text-secondary)">
            {{ item.total ? item.rate + '%' : '' }}
          </span>
          <div
            class="w-full rounded-4"
            :style="{
              height: `${item.total ? Math.max(4, item.rate) : 2}%`,
              background: item.total ? 'var(--theme-bar, #2196f3)' : 'var(--border-color)',
              opacity: item.total ? 0.55 + item.rate / 200 : 1
            }"
          ></div>
          <span class="text-10px" style="color: var(--text-secondary)">
            {{ item.label }}
          </span>
        </div>
      </div>
    </Card>

    <Card :bordered="false" class="stat-card" title="任务热力图（近 16 周）">
      <div class="overflow-x-auto">
        <div class="heatmap">
          <div
            v-for="cell in heatmap"
            :key="cell.date"
            class="heat-cell rounded-2"
            :title="`${cell.date}：${cell.done}/${cell.total}`"
            :style="{
              background: heatColors[cell.level],
              border: cell.level === 0 ? '1px solid var(--border-color)' : 'none'
            }"
          ></div>
        </div>
      </div>
      <div class="mt-8 flex items-center gap-4 text-11px" style="color: var(--text-secondary)">
        <span>少</span>
        <span
          v-for="color in heatColors"
          :key="color"
          class="w-10 h-10 rounded-2 inline-block"
          :style="{ background: color, border: '1px solid var(--border-color)' }"
        ></span>
        <span>多</span>
      </div>
    </Card>

    <div class="grid gap-12" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
      <Card :bordered="false" class="stat-card" title="心情分布">
        <div class="flex flex-col gap-10">
          <div v-for="row in moodRows" :key="row.key">
            <div class="flex items-center justify-between text-12px">
              <span>{{ row.label }}</span>
              <span style="color: var(--text-secondary)">
                {{ row.count }} 次 · {{ row.percent }}%
              </span>
            </div>
            <div class="mt-4 h-6 rounded-3" style="background: var(--surface-soft)">
              <div
                class="h-full rounded-3"
                :style="{
                  width: row.percent + '%',
                  background: '#2196f3',
                  opacity: 0.75
                }"
              ></div>
            </div>
          </div>
          <div v-if="!records.length" class="text-12px" style="color: var(--text-secondary)">
            还没有日志，写下第一篇就能看到心情分布
          </div>
        </div>
      </Card>

      <Card :bordered="false" class="stat-card" title="成就">
        <div class="grid gap-8" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr))">
          <div
            v-for="item in achievements"
            :key="item.key"
            class="p-10 rounded-8"
            :style="{
              background: item.earned ? 'rgba(33,150,243,0.1)' : 'var(--surface-soft)',
              border: '1px solid var(--border-color)',
              opacity: item.earned ? 1 : 0.55
            }"
          >
            <div class="flex items-center gap-4">
              <i-mdi-trophy-variant
                v-if="item.earned"
                class="w-14 h-14"
                style="color: #faad14"
              />
              <i-mdi-lock-outline v-else class="w-14 h-14" />
              <span class="text-12px font-semibold">{{ item.title }}</span>
            </div>
            <div class="mt-4 text-11px" style="color: var(--text-secondary)">
              {{ item.desc }}
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Card :bordered="false" class="stat-card" title="本周回顾">
      <pre
        class="report whitespace-pre-wrap text-12px leading-20"
        style="color: var(--text-primary)"
        >{{ report }}</pre
      >
      <div class="mt-10 flex gap-8">
        <Tag>周一起算</Tag>
        <Tag>可导出 Markdown</Tag>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.heatmap {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
  width: max-content;
}

.heat-cell {
  width: 12px;
  height: 12px;
}

[data-theme='dark'] .heat-cell {
  filter: brightness(0.9);
}

.report {
  margin: 0;
  font-family: inherit;
}
</style>
