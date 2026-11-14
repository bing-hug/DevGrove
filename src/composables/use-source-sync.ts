import { useKnowledgeStore } from '@/stores/knowledge-store'
import { useInterviewStore } from '@/stores/interview-store'
import type { PlanItem } from '@/types'

/**
 * 任务完成时回写来源状态（复习→任务闭环）。
 * - knowledge：把对应节点幂等置为已掌握
 * - interview：推进对应题目的艾宾浩斯复习间隔
 * 来源（节点/题目）已被删除时 store 内部静默跳过，这里再兜一层，
 * 保证回写失败绝不影响勾选完成本身。
 */
export function writebackSourceDone(
  plan: Pick<PlanItem, 'source_type' | 'source_id'>
) {
  const type = plan.source_type
  const id = plan.source_id
  if (!type || !id) return
  try {
    if (type === 'knowledge') {
      useKnowledgeStore().markMastered(String(id))
    } else if (type === 'interview') {
      useInterviewStore().markReviewed(String(id))
    }
  } catch {
    // 来源已删除，静默跳过
  }
}
