<script setup lang="ts">
import {
  Drawer,
  Form,
  FormItem,
  Upload,
  message,
  Input,
  Select,
  SelectOption
} from 'ant-design-vue'
import { getMoodOptions } from '@/enums'
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'
import type { SelectValue } from 'ant-design-vue/es/select'

const visible = ref(false)
const recordForm = reactive({
  cover: '',
  title: '',
  mood: '',
  content: '',
  record_date: ''
})

const rules = reactive({
  cover: [{ required: true, message: '封面不可以为空' }],
  title: [{ required: true, message: '标题不可以为空' }],
  mood: [{ required: true, message: '当日心情不可以为空' }],
  content: [{ required: true, message: '内容不可以为空' }]
})

const coverList = ref([])
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

function coverUpload(options: UploadRequestOption) {
  console.log(options)
}

function handleSelectChange(value: SelectValue) {
  console.log(value)
  recordForm.mood = value as string
}

function openDrawer() {
  visible.value = true
}

defineExpose({
  openDrawer
})
</script>

<template>
  <Drawer v-model:open="visible" title="添加日志" placement="right" width="500">
    <div>
      <Form
        :model="recordForm"
        :rules="rules"
        name="createRecordForm"
        autocomplete="off">
        <FormItem label="日记封面" name="cover">
          <Upload
            :file-list="coverList"
            name="cover"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="coverBeforeUpload"
            :custom-request="coverUpload">
          </Upload>
        </FormItem>

        <FormItem label="标题" name="title">
          <Input :value="recordForm.title" placeholder="请输入标题" />
        </FormItem>

        <FormItem label="今天心情" name="mood">
          <Select :value="recordForm.mood" @change="handleSelectChange">
            <SelectOption
              v-for="item in getMoodOptions()"
              :key="item.value"
              :value="item.value">
              <div>
                {{ item.emoji }}
                <span
                  :style="{
                    color: item.color
                  }">
                  {{ item.label }}</span
                >
              </div>
            </SelectOption>
          </Select>
        </FormItem>
      </Form>
    </div>
  </Drawer>
</template>

<style scoped lang="scss"></style>
