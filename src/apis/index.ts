import Http from '@/request'

/**
 * 获取所有任务
 */
interface Task {
  id?: number
  title: string
  description: string
  startDate: Date
  remark: string
  priority: string
}

export async function getAllTasks() {
  return Http.get<Task[]>('/plans')
}

export async function createPlanApi(task: Task) {
  return Http.post<Task>('/createPlan', {
    data: task
  })
}
