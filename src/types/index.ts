export type PriorityValue = 'HIGH' | 'MEDIUM' | 'LOW'

/** 任务来源：知识树节点 / 面试题 */
export type PlanSourceType = 'knowledge' | 'interview'

/** 每日计划任务 */
export interface PlanItem {
  id: number
  title: string
  description: string
  start_date: string
  priority: PriorityValue
  remark: string
  is_completed: boolean
  /** 来源类型（复习→任务闭环）；后端可能为 null，可选 */
  source_type?: PlanSourceType | null
  /** 来源 id：知识树节点 id / 面试题 id，统一字符串（节点 id 如 'js-base'） */
  source_id?: string | null
  created_at?: string
}

/** 新建 / 更新任务的提交体 */
export interface PlanPayload {
  title: string
  description: string
  start_date: string
  priority: PriorityValue
  remark: string
  is_completed: boolean
  /** 更新时不传即表示不改动来源字段（后端「显式传了才更新」语义） */
  source_type?: PlanSourceType | null
  source_id?: string | null
}

/** 生活日志 */
export interface LifeRecordItem {
  id: number
  title: string
  mood: string
  cover: string
  content: string
  life_date: string
  created_at?: string
}

/** 新建 / 更新日志的提交体 */
export interface LifeRecordPayload {
  title: string
  mood: string
  cover: string
  content: string
  life_date: string
}
