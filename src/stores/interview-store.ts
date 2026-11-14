import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'

export interface InterviewQuestion {
  id: string
  title: string
  answer: string
  tags: string[]
  level: 1 | 2 | 3
  reviewCount: number
  nextReview: string
  mastered: boolean
}

const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30]

const today = dayjs().format('YYYY-MM-DD')

const seed: InterviewQuestion[] = [
  {
    id: 'seed-1',
    title: 'Vue3 的响应式原理是什么？',
    answer:
      '基于 Proxy 拦截对象读写，读取时 track 收集依赖，写入时 trigger 通知副作用；配合 effect 实现组件更新，ref 用 RefImpl 的 getter/setter 收集依赖。',
    tags: ['Vue', '响应式'],
    level: 2,
    reviewCount: 0,
    nextReview: today,
    mastered: false
  },
  {
    id: 'seed-2',
    title: '说说浏览器的事件循环与宏微任务',
    answer:
      '每次执行一个宏任务后清空微任务队列，再进入渲染与下一个宏任务。Promise.then、queueMicrotask 属于微任务，setTimeout、消息、IO 属于宏任务。',
    tags: ['JavaScript', '异步'],
    level: 2,
    reviewCount: 0,
    nextReview: today,
    mastered: false
  },
  {
    id: 'seed-3',
    title: 'HTTP 缓存有哪些关键字段？',
    answer:
      '强缓存看 Cache-Control（max-age）与 Expires；协商缓存看 ETag/If-None-Match、Last-Modified/If-Modified-Since，命中返回 304。',
    tags: ['网络', '缓存'],
    level: 1,
    reviewCount: 0,
    nextReview: today,
    mastered: false
  }
]

const questions = useStorage<InterviewQuestion[]>('grove:interview-questions', seed)

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function addQuestion(input: {
  title: string
  answer: string
  tags: string[]
  level: 1 | 2 | 3
}) {
  questions.value.unshift({
    id: createId(),
    title: input.title,
    answer: input.answer,
    tags: input.tags,
    level: input.level,
    reviewCount: 0,
    nextReview: dayjs().format('YYYY-MM-DD'),
    mastered: false
  })
}

function updateQuestion(id: string, patch: Partial<InterviewQuestion>) {
  const target = questions.value.find((item) => item.id === id)
  if (target) Object.assign(target, patch)
}

function removeQuestion(id: string) {
  questions.value = questions.value.filter((item) => item.id !== id)
}

/** 按艾宾浩斯间隔安排下一次复习 */
function markReviewed(id: string) {
  const target = questions.value.find((item) => item.id === id)
  if (!target) return
  target.reviewCount += 1
  const interval =
    REVIEW_INTERVALS[Math.min(target.reviewCount, REVIEW_INTERVALS.length - 1)] ??
    1
  target.nextReview = dayjs().add(interval, 'day').format('YYYY-MM-DD')
  if (target.reviewCount >= 4) target.mastered = true
}

function resetProgress(id: string) {
  const target = questions.value.find((item) => item.id === id)
  if (!target) return
  target.reviewCount = 0
  target.mastered = false
  target.nextReview = dayjs().format('YYYY-MM-DD')
}

function dueQuestions(): InterviewQuestion[] {
  const todayKey = dayjs().format('YYYY-MM-DD')
  return questions.value.filter(
    (item) => !item.mastered && item.nextReview <= todayKey
  )
}

export function useInterviewStore() {
  return {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    markReviewed,
    resetProgress,
    dueQuestions
  }
}
