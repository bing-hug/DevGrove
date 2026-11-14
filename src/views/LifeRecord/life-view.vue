<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Button,
  Empty,
  Input,
  Pagination,
  Select,
  Spin,
  Tag,
  message
} from 'ant-design-vue'
import RecordIcon from '@/assets/record.svg'
import MainHeader from '@/components/main-header.vue'
import CreateRecord from '@/views/LifeRecord/components/create-record.vue'
import RecordItem from '@/views/LifeRecord/components/record-item.vue'
import RecordDetail from '@/views/LifeRecord/components/record-detail.vue'
import { useLifeStore } from '@/stores/life-store'
import { getMoodOptions } from '@/enums'
import { toPlainText } from '@/utils/sanitize'
import type { LifeRecordItem } from '@/types'

const route = useRoute()
const lifeStore = useLifeStore()

const keyword = ref('')
const moodFilter = ref('all')
const page = ref(1)
const pageSize = 9

const createRef = ref<{
  openDrawer: (record?: LifeRecordItem) => void
} | null>(null)
const detailRef = ref<{ open: () => void } | null>(null)
const activeRecord = ref<LifeRecordItem | null>(null)

const moodOptions = computed(() => [
  { value: 'all', label: '全部心情' },
  ...getMoodOptions().map((item) => ({
    value: item.value,
    label: `${item.emoji} ${item.label}`
  }))
])

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return lifeStore.records.value.filter((record) => {
    if (moodFilter.value !== 'all' && record.mood !== moodFilter.value) {
      return false
    }
    if (!kw) return true
    const text = `${record.title} ${record.life_date} ${toPlainText(record.content)}`
    return text.toLowerCase().includes(kw)
  })
})

const paged = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

watch([keyword, moodFilter], () => {
  page.value = 1
})

function openCreate() {
  createRef.value?.openDrawer()
}

function openDetail(record: LifeRecordItem) {
  activeRecord.value = record
  detailRef.value?.open()
}

function openEdit(record: LifeRecordItem) {
  createRef.value?.openDrawer(record)
}

async function refresh() {
  lifeStore.invalidate()
  await lifeStore.fetchRecords(true)
}

async function openFromQuery() {
  const id = Number(route.query.id)
  if (!id) return
  const record = lifeStore.records.value.find((item) => item.id === id)
  if (record) openDetail(record)
  else message.info('没有找到对应的日志')
}

onMounted(async () => {
  await lifeStore.fetchRecords(true)
  await openFromQuery()
})

watch(
  () => route.query.id,
  async () => {
    await openFromQuery()
  }
)
</script>

<template>
  <div class="flex flex-col gap-16">
    <MainHeader
      :icon="RecordIcon"
      title="生活滴滴点点"
      :subtitle="`共 ${lifeStore.records.value.length} 篇记录`"
      button-text="添加日志"
      @button-click="openCreate"
    />

    <div class="flex items-center gap-10 flex-wrap">
      <Input
        v-model:value="keyword"
        class="max-w-320"
        allow-clear
        placeholder="搜索标题或正文"
      >
        <template #prefix>
          <i-mdi-magnify class="w-16 h-16" style="color: #9aa8af" />
        </template>
      </Input>

      <Select
        v-model:value="moodFilter"
        :options="moodOptions"
        class="w-200"
        show-search
        option-filter-prop="label"
      />

      <Tag v-if="filtered.length !== lifeStore.records.value.length">
        筛选出 {{ filtered.length }} 篇
      </Tag>
    </div>

    <Spin :spinning="lifeStore.loading.value">
      <div
        v-if="filtered.length"
        class="grid gap-16"
        style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))"
      >
        <RecordItem
          v-for="item in paged"
          :key="item.id"
          :record="item"
          @open="openDetail"
        />
      </div>

      <Empty
        v-else-if="!lifeStore.loading.value"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        :description="
          lifeStore.records.value.length
            ? '没有匹配的日志，试试别的关键词'
            : '还没有写过日志，记录今天的心情吧'
        "
      >
        <Button type="primary" @click="openCreate">写第一篇</Button>
      </Empty>
    </Spin>

    <div v-if="filtered.length > pageSize" class="flex justify-center">
      <Pagination
        v-model:current="page"
        :page-size="pageSize"
        :total="filtered.length"
        :show-size-changer="false"
      />
    </div>

    <CreateRecord ref="createRef" @refresh="refresh" />
    <RecordDetail
      ref="detailRef"
      :record="activeRecord"
      @refresh="refresh"
      @edit="openEdit"
    />
  </div>
</template>
