import { useStorage } from '@vueuse/core'

export interface KnowledgeNode {
  id: string
  title: string
  mastered: boolean
  children: KnowledgeNode[]
}

const defaultTree: KnowledgeNode[] = [
  {
    id: 'frontend',
    title: '前端',
    mastered: false,
    children: [
      {
        id: 'js',
        title: 'JavaScript',
        mastered: false,
        children: [
          { id: 'js-base', title: '原型、闭包与 this', mastered: false, children: [] },
          { id: 'js-async', title: '事件循环与异步', mastered: false, children: [] }
        ]
      },
      {
        id: 'vue',
        title: 'Vue',
        mastered: false,
        children: [
          { id: 'vue-reactivity', title: '响应式原理', mastered: false, children: [] },
          { id: 'vue-compiler', title: '模板编译', mastered: false, children: [] }
        ]
      },
      {
        id: 'engineer',
        title: '工程化',
        mastered: false,
        children: [
          { id: 'vite', title: 'Vite 构建与插件', mastered: false, children: [] }
        ]
      }
    ]
  },
  {
    id: 'life',
    title: '生活',
    mastered: false,
    children: [{ id: 'fitness', title: '健身习惯', mastered: false, children: [] }]
  }
]

const tree = useStorage<KnowledgeNode[]>('grove:knowledge-tree', defaultTree)

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function findNode(nodes: KnowledgeNode[], id: string): KnowledgeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const hit = findNode(node.children, id)
    if (hit) return hit
  }
  return null
}

function removeFromList(nodes: KnowledgeNode[], id: string): boolean {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (!node) continue
    if (node.id === id) {
      nodes.splice(index, 1)
      return true
    }
    if (removeFromList(node.children, id)) return true
  }
  return false
}

function addNode(parentId: string | null, title: string) {
  const node: KnowledgeNode = {
    id: createId(),
    title: title.trim() || '新节点',
    mastered: false,
    children: []
  }
  if (!parentId) {
    tree.value.push(node)
    return node
  }
  const parent = findNode(tree.value, parentId)
  if (parent) parent.children.push(node)
  return node
}

function renameNode(id: string, title: string) {
  const node = findNode(tree.value, id)
  if (node && title.trim()) node.title = title.trim()
}

function removeNode(id: string) {
  removeFromList(tree.value, id)
}

function toggleMastered(id: string) {
  const node = findNode(tree.value, id)
  if (node) node.mastered = !node.mastered
}

function leafStats(node: KnowledgeNode): { total: number; mastered: number } {
  if (node.children.length === 0) {
    return { total: 1, mastered: node.mastered ? 1 : 0 }
  }
  return node.children.reduce(
    (acc, child) => {
      const sub = leafStats(child)
      return { total: acc.total + sub.total, mastered: acc.mastered + sub.mastered }
    },
    { total: 0, mastered: 0 }
  )
}

function nodeProgress(node: KnowledgeNode): number {
  const { total, mastered } = leafStats(node)
  if (total === 0) return 0
  return Math.round((mastered / total) * 100)
}

/** 扁平化树，便于列表渲染 */
function flattenTree(
  nodes: KnowledgeNode[],
  depth = 0,
  result: Array<{ node: KnowledgeNode; depth: number }> = []
) {
  for (const node of nodes) {
    result.push({ node, depth })
    flattenTree(node.children, depth + 1, result)
  }
  return result
}

function treeStats() {
  const flat = flattenTree(tree.value)
  const leaves = flat.filter((item) => item.node.children.length === 0)
  return {
    total: leaves.length,
    mastered: leaves.filter((item) => item.node.mastered).length
  }
}

export interface DueNode {
  id: string
  title: string
  /** 从根到当前节点的路径，例如「前端 / JavaScript」 */
  pathText: string
}

/**
 * 待学习节点 = 所有未掌握的叶子节点（知识树没有到期时间概念）。
 * 需要祖先路径用于生成备注，因此单独做一次带 path 的轻量遍历；
 * 叶子判断与 mastered 语义与 leafStats 保持一致。
 */
function dueNodes(): DueNode[] {
  const out: DueNode[] = []
  const walk = (nodes: KnowledgeNode[], path: string[]) => {
    for (const node of nodes) {
      if (node.children.length === 0) {
        if (!node.mastered) {
          out.push({
            id: node.id,
            title: node.title,
            pathText: [...path, node.title].join(' / ')
          })
        }
        continue
      }
      walk(node.children, [...path, node.title])
    }
  }
  walk(tree.value, [])
  return out
}

/** 幂等置为已掌握（节点不存在或已掌握则不动），用于任务完成回写 */
function markMastered(id: string) {
  const node = findNode(tree.value, id)
  if (node && !node.mastered) node.mastered = true
}

export function useKnowledgeStore() {
  return {
    tree,
    addNode,
    renameNode,
    removeNode,
    toggleMastered,
    nodeProgress,
    flattenTree,
    treeStats,
    dueNodes,
    markMastered
  }
}
