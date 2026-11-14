<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  Button,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Tag,
  message
} from 'ant-design-vue'
import dayjs from 'dayjs'
import MainHeader from '@/components/main-header.vue'
import { useInterviewStore } from '@/stores/interview-store'
import type { InterviewQuestion } from '@/stores/interview-store'

const store = useInterviewStore()

const tab = ref('due')
const expanded = reactive<Record<string, boolean>>({})

const due = computed(() => store.dueQuestions())

const list = computed<InterviewQuestion[]>(() => {
  if (tab.value === 'due') return due.value
  if (tab.value === 'mastered')
    return store.questions.value.filter((item) => item.mastered)
  return store.questions.value
})

const tabOptions = computed(() => [
  { label: `待复习 ${due.value.length}`, value: 'due' },
  { label: `全部 ${store.questions.value.length}`, value: 'all' },
  {
    label: `已掌握 ${store.questions.value.filter((item) => item.mastered).length}`,
    value: 'mastered'
  }
])

const levelMeta: Record<number, { label: string; color: string }> = {
  1: { label: '简单', color: 'green' },
  2: { label: '中等', color: 'gold' },
  3: { label: '困难', color: 'red' }
}

function levelOf(level: number) {
  return levelMeta[level] ?? { label: '一般', color: 'default' }
}

const modal = reactive({
  open: false,
  title: '',
  answer: '',
  tags: '',
  level: 2 as 1 | 2 | 3
})

const levelOptions = [
  { label: '简单', value: 1 },
  { label: '中等', value: 2 },
  { label: '困难', value: 3 }
]

function openAdd() {
  modal.title = ''
  modal.answer = ''
  modal.tags = ''
  modal.level = 2
  modal.open = true
}

function submit() {
  if (!modal.title.trim()) {
    message.warning('题目不能为空')
    return
  }
  store.addQuestion({
    title: modal.title.trim(),
    answer: modal.answer.trim(),
    tags: modal.tags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    level: modal.level
  })
  modal.open = false
  message.success('已添加到题库')
}

function handleReview(id: string) {
  store.markReviewed(id)
  message.success('已记录复习，按记忆曲线安排下次')
}

function isOverdue(item: InterviewQuestion) {
  return !item.mastered && item.nextReview <= dayjs().format('YYYY-MM-DD')
}

function toggle(id: string) {
  expanded[id] = !expanded[id]
}

function handleRemove(id: string) {
  store.removeQuestion(id)
  message.success('已删除')
}
</script>

<template>
  <div class="flex flex-col gap-16">
    <MainHeader
      title="面试题"
      :subtitle="`题库 ${store.questions.value.length} 题 · 今日待复习 ${due.length} 题`"
    >
      <template #extra>
        <Button size="small" type="primary" @click="openAdd">添加题目</Button>
      </template>
    </MainHeader>

    <div class="flex items-center gap-12 flex-wrap">
      <Segmented v-model:value="tab" :options="tabOptions" />
      <span class="text-12px" style="color: var(--text-secondary)">
        复习间隔：1 → 2 → 4 → 7 → 15 → 30 天
      </span>
    </div>

    <div v-if="list.length" class="flex flex-col gap-10">
      <div
        v-for="item in list"
        :key="item.id"
        class="p-14 rounded-10"
        style="
          background: var(--surface);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-card);
        "
      >
        <div class="flex items-center gap-8 flex-wrap">
          <span class="text-15px font-semibold flex-1 min-w-180">{{ item.title }}</span>

          <Tag :color="levelOf(item.level).color">
            {{ levelOf(item.level).label }}
          </Tag>
          <Tag v-if="item.mastered" color="success">已掌握</Tag>
          <Tag v-else-if="isOverdue(item)" color="error">待复习</Tag>
        </div>

        <div class="mt-6 flex items-center gap-10 flex-wrap text-11px" style="color: var(--text-secondary)">
          <span>已复习 {{ item.reviewCount }} 次</span>
          <span>下次复习：{{ item.nextReview }}</span>
          <Tag v-for="tag in item.tags" :key="tag" class="m-0">{{ tag }}</Tag>
        </div>

        <div
          v-if="expanded[item.id]"
          class="mt-10 p-12 rounded-8 text-13px leading-22 whitespace-pre-wrap"
          style="background: var(--surface-soft); color: var(--text-primary)"
        >
          {{ item.answer || '还没有写答案要点' }}
        </div>

        <div class="mt-10 flex items-center gap-8 flex-wrap">
          <Button size="small" @click="toggle(item.id)">
            {{ expanded[item.id] ? '收起答案' : '查看答案' }}
          </Button>
          <Button size="small" type="primary" @click="handleReview(item.id)">
            标记已复习
          </Button>
          <Button size="small" @click="store.resetProgress(item.id)">
            重置进度
          </Button>
          <Popconfirm
            title="确定删除这道题？"
            ok-text="删除"
            cancel-text="取消"
            @confirm="handleRemove(item.id)"
          >
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </div>
      </div>
    </div>

    <Empty
      v-else
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
      :description="
        tab === 'due'
          ? '今天没有需要复习的题目，休息一下'
          : '这个分类下还没有题目'
      "
    >
      <Button type="primary" @click="openAdd">添加题目</Button>
    </Empty>

    <Modal
      v-model:open="modal.open"
      title="添加面试题"
      :destroy-on-close="false"
      @ok="submit"
    >
      <div class="flex flex-col gap-10">
        <Input v-model:value="modal.title" placeholder="题目，例如「说说 Vue3 响应式原理」" />
        <Select v-model:value="modal.level" :options="levelOptions" />
        <Input v-model:value="modal.tags" placeholder="标签，用逗号或空格分隔（Vue / 网络）" />
        <Input.TextArea
          v-model:value="modal.answer"
          :auto-size="{ minRows: 4, maxRows: 8 }"
          placeholder="答案要点，便于快速回忆"
        />
      </div>
    </Modal>
  </div>
</template>
