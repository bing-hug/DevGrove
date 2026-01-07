<script setup lang="ts">
import {
  Drawer,
  Form,
  FormItem,
  Upload,
  message,
  Input,
  Select,
  SelectOption,
  type UploadChangeParam,
  type UploadFile,
  DatePicker,
  Button,
  type FormInstance
} from 'ant-design-vue'
import { getMoodOptions } from '@/enums'
import type { SelectValue } from 'ant-design-vue/es/select'
import Editor from '@/components/udeitor-plus.vue'
import { spliceImgUrl } from '@/utils/spliceImgUrl'
import { createLifeRecordApi } from '@/apis/lifeRecord.ts'

const visible = ref(false)
const lifeRecordFormRef = useTemplateRef<FormInstance>('lifeRecordFormRef')
const recordForm = reactive({
  cover: '',
  title: '',
  mood: 'joyful',
  content: '',
  life_date: ''
})

const rules = reactive({
  cover: [{ required: true, message: '封面不可以为空' }],
  title: [{ required: true, message: '标题不可以为空' }],
  mood: [{ required: true, message: '当日心情不可以为空' }],
  content: [{ required: true, message: '内容不可以为空' }],
  life_date: [{ required: true, message: '日记日期不可以为空' }]
})

const fileList = ref<UploadFile[]>([])
const coverType = ['image/jpeg', 'image/png']
const coverMaxSize = 1024 * 1024 * 5
function coverBeforeUpload(file: File) {
  console.log(file)
  if (!coverType.includes(file.type)) {
    message.error('不符合图片要求')
    return false
  }

  if (file.size > coverMaxSize) {
    message.error('封面不能大于5M')
    return false
  }
  return true
}

function handleUploadChange(info: UploadChangeParam) {
  if (info.file.status === 'done') {
    recordForm.cover = info.file.response.data || ''
    message.success(`${info.file.name} 上传成功`)
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 上传失败`)
  }
}

function updateContent(content: string) {
  recordForm.content = content
}

function handleSelectChange(value: SelectValue) {
  console.log(value)
  recordForm.mood = value as string
}

async function handleSubmit() {
  console.log(recordForm)
  await lifeRecordFormRef.value?.validate()

  try {
    const res = await createLifeRecordApi(recordForm)
    console.log(res)
    message.success('添加成功')
    visible.value = false
  } catch (error) {
    message.error('添加失败')
    console.log(error)
  }
}

function openDrawer() {
  visible.value = true
}

defineExpose({
  openDrawer
})
</script>

<template>
  <Drawer v-model:open="visible" title="添加日志" placement="right" width="600">
    <div>
      <Form
        ref="lifeRecordFormRef"
        :model="recordForm"
        :rules="rules"
        :labelCol="{ span: 4 }"
        name="createRecordForm"
        autocomplete="off"
      >
        <FormItem label="日记封面" name="cover">
          <div class="flex gap-10">
            <img
              v-show="recordForm.cover"
              :src="spliceImgUrl(recordForm.cover)"
              alt="封面"
              class="w-100 h-100 rounded-8 flex-shrink-0 object-cover"
            />

            <Upload
              v-model:file-list="fileList"
              name="file"
              action="/api/upload/uploadImg"
              list-type="picture-card"
              :show-upload-list="false"
              :before-upload="coverBeforeUpload"
              @change="handleUploadChange"
            >
              <i-mdi-image-add-outline class="w-32 h-32 color-[#9aa8af]" />
            </Upload>
          </div>
        </FormItem>

        <FormItem label="标题" name="title">
          <Input v-model:value="recordForm.title" placeholder="请输入标题" />
        </FormItem>

        <FormItem label="今天心情" name="mood">
          <Select
            :value="recordForm.mood"
            placeholder="Automatic tokenization"
            @change="handleSelectChange"
          >
            <SelectOption
              v-for="item in getMoodOptions()"
              :key="item.value"
              :value="item.value"
            >
              <div>
                {{ item.emoji }}
                <span
                  :style="{
                    color: item.color
                  }"
                >
                  {{ item.label }}</span
                >
              </div>
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="日记日期" name="life_date">
          <DatePicker
            v-model:value="recordForm.life_date"
            placeholder="请选择日记日期"
          />
        </FormItem>

        <FormItem label="内容" name="content">
          <div>
            <Editor
              v-model:value="recordForm.content"
              @updateContent="updateContent"
            />
          </div>
        </FormItem>
      </Form>
    </div>
    <template #footer>
      <Button type="primary" @click="handleSubmit">提交</Button>
    </template>
  </Drawer>
</template>

<style scoped lang="scss"></style>
