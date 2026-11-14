import type { PlanPayload } from '@/types'

/** 首次使用时的示例任务（只在完全没有数据时写入一次） */
export const defaultTaskList: PlanPayload[] = [
  {
    title: '单词',
    description: '看两集 B 站单词课',
    start_date: '',
    priority: 'HIGH',
    remark: '时间：大约 30 分钟',
    is_completed: false
  },
  {
    title: '看书',
    description: '书籍：平凡的世界',
    start_date: '',
    priority: 'MEDIUM',
    remark: '时间：1 小时',
    is_completed: false
  },
  {
    title: '运动',
    description: '1. 俯卧撑 15 个\n2. 哑铃 50 个\n3. 跑步两公里',
    start_date: '',
    priority: 'HIGH',
    remark: '时间：1 个半小时',
    is_completed: false
  },
  {
    title: '前端',
    description: '前端面试题两道',
    start_date: '',
    priority: 'HIGH',
    remark: '时间：30 分钟',
    is_completed: false
  }
]
