import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { getAllPlansApi } from '@/apis/plan'
import type { PlanItem } from '@/types'
import { toDateKey } from '@/utils/stats'

const plans = ref<PlanItem[]>([])
const loading = ref(false)
const loadError = ref('')
const loadedAt = ref(0)
/** 是否至少成功拉取过一次数据（用于区分「空数据」和「没拉到」） */
const loaded = computed(() => loadedAt.value > 0)

async function fetchPlans(force = false): Promise<PlanItem[]> {
  if (loading.value) return plans.value
  if (!force && loadedAt.value) return plans.value

  loading.value = true
  loadError.value = ''
  try {
    const res = await getAllPlansApi()
    plans.value = res.data || []
    loadedAt.value = Date.now()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    loading.value = false
  }
  return plans.value
}

function plansOf(date: string): PlanItem[] {
  return plans.value.filter((item) => toDateKey(item.start_date) === date)
}

function overduePlans(today = dayjs().format('YYYY-MM-DD')): PlanItem[] {
  return plans.value.filter(
    (item) => !item.is_completed && toDateKey(item.start_date) < today
  )
}

function invalidate() {
  loadedAt.value = 0
}

export function usePlanStore() {
  return {
    plans,
    loading,
    loadError,
    loaded,
    fetchPlans,
    plansOf,
    overduePlans,
    invalidate
  }
}
