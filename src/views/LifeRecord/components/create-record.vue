<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  Select,
  Upload,
  message
} from 'ant-design-vue'
import type {
  FormInstance,
  UploadChangeParam,
  UploadFile
} from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import Editor from '@/components/udeitor-plus.vue'
import { createLifeRecordApi, updateLifeRecordApi } from '@/apis/lifeRecord'
import { getMoodOptions } from '@/enums'
import { spliceImgUrl, uploadAction } from '@/utils/spliceImgUrl'
import type { LifeRecordItem, LifeRecordPayload } from '@/types'

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

const visible = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance | null>(null)
const fileList = ref<UploadFile[]>([])

const form = reactive<{
  cover: string
  title: string
  mood: string
  content: string
  lifeDate: Dayjs | undefined
}>({
  cover: '',
  title: '',
  mood: 'joyful',
  content: '',
  lifeDate: dayjs()
})

const rules = {
  cover: [{ required: true, message: '封面不可以为空' }],
  title: [{ required: true, message: '标题不可以为空' }],
  mood: [{ required: true, message: '当日心情不可以为空' }],
  content: [{ required: true, message: '内容不可以为空' }],
  lifeDate: [{ required: true, message: '日记日期不可以为空' }]
}

const moodOptions = computed(() =>
  getMoodOptions().map((item) => ({
    value: item.value,
    label: `${item.emoji} ${item.label}`
  }))
)

const uploadHeaders = computed(() => {
  const headers: Record<string, string> = {}
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = token
  return headers
})

const MAX_COVER_SIZE = 5 * 1024 * 1024
const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function beforeUpload(file: File) {
  if (!COVER_TYPES.includes(file.type)) {
    message.error('封面仅支持 JPG / PNG / WebP')
    return false
  }
  if (file.size > MAX_COVER_SIZE) {
    message.error('封面不能超过 5MB')
    return false
  }
  return true
}

function handleUploadChange(info: UploadChangeParam) {
  if (info.file.status === 'done') {
    const response = info.file.response as
      | { success?: boolean; data?: string; errorMsg?: string }
      | undefined

    if (response && response.success === false) {
      message.error(response.errorMsg || '封面上传失败')
      return
    }
    const url = typeof response?.data === 'string' ? response.data : ''
    if (!url) {
      message.error('上传接口返回的数据格式不正确')
      return
    }
    form.cover = url
    fileList.value = [{ ...info.file, url: spliceImgUrl(url) }]
    message.success('封面已上传')
  } else if (info.file.status === 'error') {
    message.error('封面上传失败，请稍后重试')
  }
}

function resetForm() {
  form.cover = ''
  form.title = ''
  form.mood = 'joyful'
  form.content = ''
  form.lifeDate = dayjs()
  fileList.value = []
  formRef.value?.clearValidate()
}

/** 打开抽屉：传 record 为编辑 */
function openDrawer(record?: LifeRecordItem) {
  resetForm()
  if (record) {
    editingId.value = record.id
    form.cover = record.cover
    form.title = record.title
    form.mood = record.mood
    form.content = record.content
    form.lifeDate = record.life_date ? dayjs(record.life_date) : dayjs()
    fileList.value = record.cover
      ? [
          {
            uid: `cover-${record.id}`,
            name: '封面',
            status: 'done',
            url: spliceImgUrl(record.cover)
          } as UploadFile
        ]
      : []
  } else {
    editingId.value = null
  }
  visible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const payload: LifeRecordPayload = {
    cover: form.cover,
    title: form.title.trim(),
    mood: form.mood,
    content: form.content,
    life_date: (form.lifeDate || dayjs()).format('YYYY-MM-DD')
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateLifeRecordApi({ ...payload, id: editingId.value })
      message.success('日志已更新')
    } else {
      await createLifeRecordApi(payload)
      message.success('日志已添加')
    }
    visible.value = false
    emits('refresh')
  } catch {
    // 失败提示由请求拦截器统一处理
  } finally {
    submitting.value = false
  }
}

watch(visible, (open) => {
  if (!open) {
    editingId.value = null
    resetForm()
  }
})

defineExpose({ openDrawer })
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="editingId ? '编辑日志' : '添加日志'"
    placement="right"
    :width="600"
  >
    <Form
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="{ span: 4 }"
      autocomplete="off"
    >
      <FormItem label="日记封面" name="cover">
        <div class="flex gap-10 items-start">
          <img
            v-if="form.cover"
            :src="spliceImgUrl(form.cover)"
            alt="封面"
            class="w-100 h-100 rounded-8 object-cover flex-shrink-0"
          />

          <Upload
            v-model:file-list="fileList"
            name="file"
            :action="uploadAction"
            :headers="uploadHeaders"
            list-type="picture-card"
            accept="image/*"
            :max-count="1"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleUploadChange"
          >
            <i-mdi-image-add-outline class="w-28 h-28" style="color: #9aa8af" />
          </Upload>
        </div>
      </FormItem>

      <FormItem label="标题" name="title">
        <Input v-model:value="form.title" placeholder="给这一天起个标题" />
      </FormItem>

      <FormItem label="今天心情" name="mood">
        <Select
          v-model:value="form.mood"
          :options="moodOptions"
          show-search
          option-filter-prop="label"
          placeholder="选择今天的心情"
        />
      </FormItem>

      <FormItem label="日记日期" name="lifeDate">
        <DatePicker
          v-model:value="form.lifeDate"
          class="w-full"
          placeholder="请选择日记日期"
        />
      </FormItem>

      <FormItem label="内容" name="content">
        <Editor v-model="form.content" />
      </FormItem>
    </Form>

    <template #footer>
      <div class="flex justify-end gap-8">
        <Button @click="visible = false">取消</Button>
        <Button type="primary" :loading="submitting" @click="handleSubmit">
          提交
        </Button>
      </div>
    </template>
  </Drawer>
</template>
