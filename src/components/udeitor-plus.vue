<script setup lang="ts">
const emits = defineEmits(['updateContent'])
const content = ref('今天怎么样了')

watch(
  () => content.value,
  (newValue) => {
    emits('updateContent', newValue)
  }
)

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
    :editorDependencies="['ueditor.config.js', 'ueditor.all.js']"
    style="width: 100%" />
</template>

<style scoped lang="scss"></style>
