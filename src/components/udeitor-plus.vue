<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
  }>(),
  {
    modelValue: ''
  }
)

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const content = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    if (value !== content.value) content.value = value
  }
)

watch(content, (value) => {
  emits('update:modelValue', value)
})

const editorConfig = {
  // 后端服务地址，后端处理参考
  // https://open-doc.modstart.com/ueditor-plus/backend.html
  serverUrl: '',
  UEDITOR_HOME_URL: '/static/UEditorPlus/',
  UEDITOR_CORS_URL: '/static/UEditorPlus/',
  initialFrameWidth: '100%'
}
</script>

<template>
  <vue-ueditor-wrap
    v-model="content"
    editor-id="editor"
    :config="editorConfig"
    :editor-dependencies="['ueditor.config.js', 'ueditor.all.js']"
    style="width: 100%"
  />
</template>
