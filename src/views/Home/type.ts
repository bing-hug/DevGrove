export interface PlanItemInfo {
  id: number
  title: string
  description: string
  start_date: Date
  priority: string
  remark: string
  is_completed: boolean
  created_at: Date
}

export const defaultTaskList = [
  {
    title: '单词',
    description: '看两集B站单词',
    start_date: new Date(),
    priority: 'HIGH',
    remark: '时间：大约30分钟',
    is_completed: false,
    created_at: new Date()
  },
  {
    title: '看书',
    description: '书籍：平凡的世界',
    start_date: new Date(),
    priority: 'MEDIUM',
    remark: '时间：1小时',
    is_completed: false,
    created_at: new Date()
  },
  {
    title: '运动',
    description: '1. 俯卧撑15个 2.哑铃50个 3.跑步两公里',
    start_date: new Date(),
    priority: 'HIGH',
    remark: '时间：1个半小时',
    is_completed: false,
    created_at: new Date()
  },
  {
    title: '前端',
    description: '前端面试题两道',
    start_date: new Date(),
    priority: 'HIGH',
    remark: '时间：30分钟',
    is_completed: false,
    created_at: new Date()
  }
]
