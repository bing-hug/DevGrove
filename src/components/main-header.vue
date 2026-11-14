<script setup lang="ts">
import { Button } from 'ant-design-vue'

withDefaults(
  defineProps<{
    icon?: string
    title: string
    subtitle?: string
    buttonText?: string
  }>(),
  {
    buttonText: ''
  }
)

const emits = defineEmits<{
  (e: 'buttonClick'): void
}>()
</script>

<template>
  <header
    class="main-header flex justify-between items-center gap-16 p-16 rounded-10"
  >
    <div class="flex gap-16 items-center min-w-0">
      <img
        v-if="icon"
        :src="icon"
        alt=""
        class="flex-shrink-0 w-44 h-44 object-contain"
      />
      <div class="min-w-0">
        <div class="font-24 font-bold truncate">{{ title }}</div>
        <div
          v-if="subtitle"
          class="mt-2 text-12px"
          style="color: var(--text-secondary)"
        >
          {{ subtitle }}
        </div>
      </div>
    </div>
    <div class="flex items-center gap-12 flex-shrink-0">
      <slot name="extra" />
      <Button v-if="buttonText" type="primary" @click="emits('buttonClick')">
        {{ buttonText }}
      </Button>
    </div>
  </header>
</template>

<style scoped>
.main-header {
  background: var(--surface);
  box-shadow: var(--shadow-card);
}
</style>
