<script setup lang="ts">
import {
  Modal,
  Button,
  Form,
  FormItem,
  Input,
  Textarea,
  DatePicker,
  Select,
  SelectOption
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import { createPlanApi } from '@/apis'
import { priorityEnum } from '@/enums/index.ts'

interface FormState {
  title: string
  description: string
  priority: string
  startDate: Dayjs
  remark: string
}

const createTaskFormRef = useTemplateRef<FormInstance>('createTaskFormRef')
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

const submitLoading = ref(false)
async function handleCreateTask() {
  await createTaskFormRef.value?.validate()
  try {
    submitLoading.value = true
    const params = {
      ...form,
      startDate: dayjs(form.startDate).toDate()
    }
    await createPlanApi(params)
  } catch (error) {
    console.log(error)
  } finally {
    submitLoading.value = false
  }
}

const visible = ref(false)

function openModal() {
  visible.value = true
}

defineExpose({
  openModal
})
</script>

<template>
  <Modal title="添加任务" v-model:open="visible" :mask-closable="false">
    <div class="task-create-form">
      <Form
        ref="createTaskFormRef"
        :model="form"
        :rules="formRules"
        layout="vertical"
        autocomplete="off">
        <FormItem label="任务名称" name="title">
          <Input v-model:value="form.title" placeholder="请输入任务名称" />
        </FormItem>

        <FormItem label="任务描述" name="description">
          <Textarea
            v-model:value="form.description"
            :autoSize="{
              minRows: 3,
              maxRows: 6
            }"
            placeholder="请输入任务描述" />
        </FormItem>

        <FormItem label="开始时间" name="startDate">
          <DatePicker
            v-model:value="form.startDate"
            placeholder="请选择开始时间" />
        </FormItem>

        <FormItem label="优先级" name="remark">
          <Select
            v-model:value="form.priority"
            :defaultActiveFirstOption="true"
            placeholder="请选择任务优先级">
            <SelectOption
              v-for="item in priorityEnum"
              :key="item.value"
              :value="item.value">
              <div class="flex items-center gap-10">
                <img
                  :src="item.icon"
                  :alt="item.label"
                  class="w-24"
                  style="width: 24px" />
                <div>{{ item.label }}</div>
              </div>
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem label="备注" name="remark">
          <Input v-model:value="form.remark" placeholder="请输入备注（可选）" />
        </FormItem>
      </Form>
    </div>
    <template #footer>
      <Button type="primary" @click="visible = false">取消</Button>
      <Button type="primary" :loading="submitLoading" @click="handleCreateTask"
        >确定</Button
      >
    </template>
  </Modal>
</template>

<style scoped lang="scss">
:deep(.ant-picker) {
  width: 100%;
}
</style>
