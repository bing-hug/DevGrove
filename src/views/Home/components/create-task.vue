<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  Button,
  DatePicker,
  Form,
  FormItem,
  Input,
  Modal,
  Select,
  SelectOption,
  Textarea,
  message
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { createPlanApi, updatePlanApi } from '@/apis/plan'
import { priorityEnum } from '@/enums'
import type { PlanItem, PlanPayload, PriorityValue } from '@/types'

interface FormState {
  title: string
  description: string
  priority: PriorityValue
  startDate: Dayjs
  remark: string
}

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

const visible = ref(false)
const editingId = ref<number | null>(null)
const editingCompleted = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance | null>(null)

const form = reactive<FormState>({
  title: '',
  description: '',
  priority: 'HIGH',
  startDate: dayjs(),
  remark: ''
})

const formRules = {
  title: [{ required: true, message: '请输入任务名称' }],
  description: [{ required: true, message: '请输入任务描述' }],
  priority: [{ required: true, message: '请选择任务优先级' }],
  startDate: [{ required: true, message: '请选择开始时间' }]
}

const isEdit = computed(() => editingId.value !== null)

function resetForm() {
  form.title = ''
  form.description = ''
  form.priority = 'HIGH'
  form.startDate = dayjs()
  form.remark = ''
  formRef.value?.clearValidate()
}

/** 打开弹窗：传 item 为编辑，否则为新建 */
function openModal(item?: PlanItem) {
  resetForm()
  if (item) {
    editingId.value = item.id
    editingCompleted.value = item.is_completed
    form.title = item.title
    form.description = item.description
    form.priority = item.priority
    form.startDate = dayjs(item.start_date)
    form.remark = item.remark
  } else {
    editingId.value = null
    editingCompleted.value = false
  }
  visible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const payload: PlanPayload = {
    title: form.title.trim(),
    description: form.description.trim(),
    priority: form.priority,
    start_date: form.startDate.format('YYYY-MM-DD'),
    remark: form.remark.trim(),
    is_completed: isEdit.value ? editingCompleted.value : false
  }

  submitLoading.value = true
  try {
    if (editingId.value) {
      await updatePlanApi({ ...payload, id: editingId.value })
      message.success('任务已更新')
    } else {
      await createPlanApi(payload)
      message.success('任务已添加')
    }
    visible.value = false
    emits('refresh')
  } catch {
    // 错误提示由请求拦截器统一处理
  } finally {
    submitLoading.value = false
  }
}

watch(visible, (open) => {
  if (!open) {
    editingId.value = null
    resetForm()
  }
})

defineExpose({ openModal })
</script>

<template>
  <Modal
    v-model:open="visible"
    :title="isEdit ? '编辑任务' : '添加任务'"
    :mask-closable="false"
    destroy-on-close
  >
    <Form
      ref="formRef"
      :model="form"
      :rules="formRules"
      layout="vertical"
      autocomplete="off"
    >
      <FormItem label="任务名称" name="title">
        <Input v-model:value="form.title" placeholder="请输入任务名称" />
      </FormItem>

      <FormItem label="任务描述" name="description">
        <Textarea
          v-model:value="form.description"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          placeholder="请输入任务描述"
        />
      </FormItem>

      <div class="flex gap-12">
        <FormItem label="开始时间" name="startDate" class="flex-1">
          <DatePicker
            v-model:value="form.startDate"
            class="w-full"
            placeholder="请选择开始时间"
          />
        </FormItem>

        <FormItem label="优先级" name="priority" class="flex-1">
          <Select
            v-model:value="form.priority"
            placeholder="请选择任务优先级"
          >
            <SelectOption
              v-for="item in priorityEnum"
              :key="item.value"
              :value="item.value"
            >
              <div class="flex items-center gap-8">
                <img :src="item.icon" :alt="item.label" class="w-18 h-18" />
                <span>{{ item.label }}</span>
              </div>
            </SelectOption>
          </Select>
        </FormItem>
      </div>

      <FormItem label="备注" name="remark">
        <Input v-model:value="form.remark" placeholder="时间安排等补充说明（可选）" />
      </FormItem>
    </Form>

    <template #footer>
      <Button @click="visible = false">取消</Button>
      <Button type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ isEdit ? '保存' : '确定' }}
      </Button>
    </template>
  </Modal>
</template>
