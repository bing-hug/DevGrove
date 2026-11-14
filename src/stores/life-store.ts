import { ref } from 'vue'
import { getLifeRecordListApi } from '@/apis/lifeRecord'
import { toDateKey } from '@/utils/stats'
import type { LifeRecordItem } from '@/types'

const records = ref<LifeRecordItem[]>([])
const loading = ref(false)
const loadError = ref('')
const loadedAt = ref(0)

async function fetchRecords(force = false): Promise<LifeRecordItem[]> {
  if (loading.value) return records.value
  if (!force && loadedAt.value) return records.value

  loading.value = true
  loadError.value = ''
  try {
    const res = await getLifeRecordListApi()
    records.value = (res.data || []).slice().sort((a, b) => {
      // 后端 life_date 可能是短日期或 LocalDateTime 全量串，统一按日期部分比较
      const dayA = toDateKey(a.life_date)
      const dayB = toDateKey(b.life_date)
      if (dayA === dayB) return b.id - a.id
      return dayA < dayB ? 1 : -1
    })
    loadedAt.value = Date.now()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    loading.value = false
  }
  return records.value
}

function invalidate() {
  loadedAt.value = 0
}

export function useLifeStore() {
  return { records, loading, loadError, fetchRecords, invalidate }
}
