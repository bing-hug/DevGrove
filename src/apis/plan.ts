import Http from '@/request'
import type { PlanItem, PlanPayload } from '@/types'

/** 获取全部任务（日历、统计、搜索共用） */
export function getAllPlansApi() {
  return Http.get<PlanItem[]>('/plans')
}

/** 按开始日期查询 */
export function queryPlansByDateApi(start_date: string) {
  return Http.get<PlanItem[]>('/plans/byStartDate', {
    params: { start_date }
  })
}

/** 新建任务 */
export function createPlanApi(data: PlanPayload) {
  return Http.post<PlanItem>('/createPlan', { data })
}

/** 更新任务 */
export function updatePlanApi(data: PlanPayload & { id: number }) {
  return Http.post<PlanItem>('/updatePlan', { data })
}

/** 设置完成状态 */
export function setPlanStatusApi(data: { id: number; is_completed: boolean }) {
  return Http.post<PlanItem>('/setPlanStatus', { data })
}

/** 更新备注 */
export function updatePlanRemarkApi(data: { id: number; remark: string }) {
  return Http.post<PlanItem>('/setPlanRemark', { data })
}

/** 删除任务 */
export function deletePlanApi(id: number) {
  return Http.post<PlanItem>('/delPlan', { params: { id } })
}
