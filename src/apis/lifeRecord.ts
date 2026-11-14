import Http from '@/request'
import type { LifeRecordItem, LifeRecordPayload } from '@/types'

/** 获取生活日志列表 */
export function getLifeRecordListApi() {
  return Http.get<LifeRecordItem[]>('/lifeRecords')
}

/** 新建生活日志 */
export function createLifeRecordApi(data: LifeRecordPayload) {
  return Http.post<LifeRecordItem>('/createLifeRecord', { data })
}

/** 更新生活日志 */
export function updateLifeRecordApi(data: LifeRecordPayload & { id: number }) {
  return Http.post<LifeRecordItem>('/updateLifeRecord', { data })
}

/** 删除生活日志 */
export function deleteLifeRecordApi(id: number) {
  return Http.post<LifeRecordItem>('/delLifeRecord', { params: { id } })
}
