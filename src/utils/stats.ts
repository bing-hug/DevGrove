import dayjs, { type Dayjs } from 'dayjs'
import { getSingleMood } from '@/enums'
import type { LifeRecordItem, PlanItem } from '@/types'

export const DATE_FORMAT = 'YYYY-MM-DD'
export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export function toDateKey(value: string | Date | Dayjs): string {
  return dayjs(value).format(DATE_FORMAT)
}

/** 以周一为一周起点 */
export function startOfWeek(day: Dayjs): Dayjs {
  return day.subtract((day.day() + 6) % 7, 'day').startOf('day')
}

export function weekDays(anchor: Dayjs = dayjs()): Dayjs[] {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, index) => start.add(index, 'day'))
}

export function groupByDate(plans: PlanItem[]): Record<string, PlanItem[]> {
  const map: Record<string, PlanItem[]> = {}
  for (const plan of plans) {
    const key = toDateKey(plan.start_date)
    if (!map[key]) map[key] = []
    map[key].push(plan)
  }
  return map
}

export interface DayStat {
  total: number
  done: number
  rate: number
}

export function dayStats(list: PlanItem[] | undefined): DayStat {
  const total = list?.length || 0
  const done = list?.filter((item) => item.is_completed).length || 0
  return { total, done, rate: total ? Math.round((done / total) * 100) : 0 }
}

export function overallStats(plans: PlanItem[]): DayStat {
  return dayStats(plans)
}

function isFullDone(list?: PlanItem[]) {
  return !!list && list.length > 0 && list.every((item) => item.is_completed)
}

/** 连续「当日任务全部完成」的天数，今天没做完则从昨天开始算 */
export function calcStreak(plans: PlanItem[]): number {
  const groups = groupByDate(plans)
  let cursor = dayjs().startOf('day')
  const todayKey = cursor.format(DATE_FORMAT)

  if (!isFullDone(groups[todayKey])) {
    cursor = cursor.subtract(1, 'day')
  }

  let streak = 0
  while (isFullDone(groups[cursor.format(DATE_FORMAT)])) {
    streak += 1
    cursor = cursor.subtract(1, 'day')
  }
  return streak
}

export interface HeatmapCell {
  date: string
  total: number
  done: number
  level: 0 | 1 | 2 | 3 | 4
}

/** 最近 weeks 周的任务热力图（每列一周） */
export function buildHeatmap(plans: PlanItem[], weeks = 16): HeatmapCell[] {
  const groups = groupByDate(plans)
  const today = dayjs().startOf('day')
  const firstDay = startOfWeek(today).subtract(weeks - 1, 'week')

  const cells: HeatmapCell[] = []
  for (let index = 0; index < weeks * 7; index += 1) {
    const key = firstDay.add(index, 'day').format(DATE_FORMAT)
    const list = groups[key] || []
    const { total, done } = dayStats(list)
    let level: HeatmapCell['level'] = 0
    if (total > 0) {
      const rate = done / total
      if (rate === 1) level = 4
      else if (rate >= 0.75) level = 3
      else if (rate >= 0.5) level = 2
      else level = 1
    }
    cells.push({ date: key, total, done, level })
  }
  return cells
}

export type MoodCategory = 'positive' | 'neutral' | 'negative' | 'special'

export const MOOD_CATEGORY_LABEL: Record<MoodCategory, string> = {
  positive: '积极',
  neutral: '中性',
  negative: '消极',
  special: '状态'
}

export function moodCategoryStats(records: LifeRecordItem[]) {
  const result: Record<MoodCategory, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
    special: 0
  }
  for (const record of records) {
    const mood = getSingleMood(record.mood)
    if (mood) result[mood.category] += 1
  }
  return result
}

export function topMoods(records: LifeRecordItem[], limit = 3) {
  const counter = new Map<string, { label: string; emoji: string; count: number }>()
  for (const record of records) {
    const mood = getSingleMood(record.mood)
    if (!mood) continue
    const current = counter.get(mood.value)
    if (current) current.count += 1
    else counter.set(mood.value, { label: mood.label, emoji: mood.emoji, count: 1 })
  }
  return [...counter.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export interface Achievement {
  key: string
  title: string
  desc: string
  earned: boolean
}

export function buildAchievements(
  plans: PlanItem[],
  records: LifeRecordItem[]
): Achievement[] {
  const groups = groupByDate(plans)
  const doneTotal = plans.filter((item) => item.is_completed).length
  const fullDays = Object.values(groups).filter((list) => isFullDone(list)).length
  const streak = calcStreak(plans)
  const diary = records.length

  return [
    {
      key: 'first-task',
      title: '第一步',
      desc: '完成第一个任务',
      earned: doneTotal >= 1
    },
    {
      key: 'ten-task',
      title: '渐入佳境',
      desc: '累计完成 10 个任务',
      earned: doneTotal >= 10
    },
    {
      key: 'hundred-task',
      title: '百事达成',
      desc: '累计完成 100 个任务',
      earned: doneTotal >= 100
    },
    {
      key: 'perfect-day',
      title: '完美一天',
      desc: '某天的任务全部完成',
      earned: fullDays >= 1
    },
    {
      key: 'streak-3',
      title: '小有节奏',
      desc: '连续 3 天完成当日全部任务',
      earned: streak >= 3
    },
    {
      key: 'streak-7',
      title: '一周不断',
      desc: '连续 7 天完成当日全部任务',
      earned: streak >= 7
    },
    {
      key: 'diary-10',
      title: '记录生活',
      desc: '累计写下 10 篇日志',
      earned: diary >= 10
    },
    {
      key: 'diary-30',
      title: '长期主义',
      desc: '累计写下 30 篇日志',
      earned: diary >= 30
    }
  ]
}

/** 生成周报 Markdown */
export function buildWeeklyReport(
  plans: PlanItem[],
  records: LifeRecordItem[],
  anchor: Dayjs = dayjs()
): string {
  const days = weekDays(anchor)
  const groups = groupByDate(plans)
  const keys = days.map((day) => day.format(DATE_FORMAT))

  const weekPlans = plans.filter((plan) => keys.includes(toDateKey(plan.start_date)))
  const weekRecords = records.filter((record) =>
    keys.includes(toDateKey(record.life_date))
  )
  const weekStat = dayStats(weekPlans)
  const moods = topMoods(weekRecords)
  const streak = calcStreak(plans)

  const dayLines = days.map((day) => {
    const key = day.format(DATE_FORMAT)
    const stat = dayStats(groups[key])
    const diary = weekRecords.filter(
      (record) => toDateKey(record.life_date) === key
    ).length
    return `| ${day.format('MM-DD')} 周${WEEKDAY_LABELS[day.day()] ?? ''} | ${stat.done}/${stat.total} | ${diary} |`
  })

  const moodLine =
    moods.length > 0
      ? moods.map((mood) => `${mood.emoji} ${mood.label} × ${mood.count}`).join('，')
      : '本周还没有记录心情'

  const firstDay = days[0]
  const lastDay = days[6]

  return [
    `# 本周回顾（${firstDay?.format('MM-DD') ?? ''} ~ ${lastDay?.format('MM-DD') ?? ''}）`,
    '',
    `- 任务完成：${weekStat.done} / ${weekStat.total}（完成率 ${weekStat.rate}%）`,
    `- 连续达标：${streak} 天`,
    `- 写下日志：${weekRecords.length} 篇`,
    `- 主要心情：${moodLine}`,
    '',
    '## 每日明细',
    '',
    '| 日期 | 任务(完成/总数) | 日志 |',
    '| --- | --- | --- |',
    ...dayLines,
    '',
    '## 一句话总结',
    '',
    weekStat.rate >= 80
      ? '这周节奏很稳，继续保持。'
      : weekStat.total === 0
        ? '这周还没有安排任务，先给下周定 3 件小事吧。'
        : '完成率还有提升空间，下周把任务拆得更小一点。'
  ].join('\n')
}
