<script setup lang="ts">
import { computed, reactive } from 'vue'
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Progress,
  Switch,
  Tag,
  message
} from 'ant-design-vue'
import MainHeader from '@/components/main-header.vue'
import { useKnowledgeStore } from '@/stores/knowledge-store'
import type { KnowledgeNode } from '@/stores/knowledge-store'

const store = useKnowledgeStore()

const rows = computed(() => store.flattenTree(store.tree.value))
const stats = computed(() => store.treeStats())

const modal = reactive({
  open: false,
  mode: 'add' as 'add' | 'rename',
  parentId: null as string | null,
  id: '',
  value: ''
})

function openAdd(parentId: string | null) {
  modal.mode = 'add'
  modal.parentId = parentId
  modal.id = ''
  modal.value = ''
  modal.open = true
}

function openRename(node: KnowledgeNode) {
  modal.mode = 'rename'
  modal.parentId = null
  modal.id = node.id
  modal.value = node.title
  modal.open = true
}

function confirmModal() {
  if (!modal.value.trim()) {
    message.warning('节点名称不能为空')
    return
  }
  if (modal.mode === 'add') {
    store.addNode(modal.parentId, modal.value)
  } else {
    store.renameNode(modal.id, modal.value)
  }
  modal.open = false
}

function handleRemove(node: KnowledgeNode) {
  store.removeNode(node.id)
  message.success('已删除该节点')
}
</script>

<template>
  <div class="flex flex-col gap-16">
    <MainHeader
      title="知识树"
      :subtitle="`已掌握 ${stats.mastered} / ${stats.total} 个知识点`"
    >
      <template #extra>
        <Button size="small" type="primary" @click="openAdd(null)">
          添加根节点
        </Button>
      </template>
    </MainHeader>

    <Card :bordered="false" class="tree-card">
      <div v-if="rows.length" class="flex flex-col gap-2">
        <div
          v-for="{ node, depth } in rows"
          :key="node.id"
          class="knowledge-row flex items-center gap-8 py-8 rounded-8"
          :style="{ paddingLeft: `${10 + depth * 20}px`, paddingRight: '10px' }"
        >
          <i-mdi-chevron-right
            v-if="node.children.length"
            class="w-14 h-14 flex-shrink-0"
            style="color: var(--text-secondary)"
          />
          <i-mdi-circle-small
            v-else
            class="w-14 h-14 flex-shrink-0"
            style="color: var(--text-secondary)"
          />

          <span
            class="text-14px truncate"
            :style="{
              color: node.mastered ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: node.mastered ? 'line-through' : 'none'
            }"
          >
            {{ node.title }}
          </span>

          <Tag v-if="!node.children.length" :color="node.mastered ? 'success' : 'default'">
            {{ node.mastered ? '已掌握' : '待学习' }}
          </Tag>

          <div v-else class="flex items-center gap-6" style="width: 150px">
            <Progress
              :percent="store.nodeProgress(node)"
              :show-info="false"
              size="small"
            />
            <span class="text-11px" style="color: var(--text-secondary)">
              {{ store.nodeProgress(node) }}%
            </span>
          </div>

          <div class="flex-1"></div>

          <Switch
            v-if="!node.children.length"
            size="small"
            :checked="node.mastered"
            @change="store.toggleMastered(node.id)"
          />

          <Button size="small" type="text" @click="openAdd(node.id)">
            子节点
          </Button>
          <Button size="small" type="text" @click="openRename(node)">
            重命名
          </Button>
          <Popconfirm
            title="删除该节点及其子节点？"
            ok-text="删除"
            cancel-text="取消"
            @confirm="handleRemove(node)"
          >
            <Button size="small" type="text" danger>删除</Button>
          </Popconfirm>
        </div>
      </div>

      <Empty
        v-else
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="还没有知识节点，先加一个大方向吧"
      >
        <Button type="primary" @click="openAdd(null)">添加根节点</Button>
      </Empty>
    </Card>

    <Card :bordered="false" class="tree-card" title="说明">
      <div class="text-12px leading-22" style="color: var(--text-secondary)">
        叶子节点可以标记「已掌握」，父节点的进度会按子节点自动汇总。数据保存在本机浏览器（localStorage），不依赖后端接口。
      </div>
    </Card>

    <Modal
      v-model:open="modal.open"
      :title="modal.mode === 'add' ? '添加节点' : '重命名节点'"
      :destroy-on-close="false"
      @ok="confirmModal"
    >
      <Input
        v-model:value="modal.value"
        placeholder="节点名称，例如「闭包与作用域」"
        @press-enter="confirmModal"
      />
    </Modal>
  </div>
</template>

<style scoped>
.tree-card {
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.knowledge-row:hover {
  background: var(--surface-soft);
}
</style>
