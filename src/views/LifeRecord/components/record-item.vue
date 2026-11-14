<script setup lang="ts">
import { ref } from 'vue'
import { Card } from 'ant-design-vue'
import { getSingleMood } from '@/enums'
import { spliceImgUrl } from '@/utils/spliceImgUrl'
import { toPlainText } from '@/utils/sanitize'
import { toDateKey } from '@/utils/stats'
import type { LifeRecordItem } from '@/types'

const props = defineProps<{
  record: LifeRecordItem
}>()

const emits = defineEmits<{
  (e: 'open', record: LifeRecordItem): void
}>()

const mood = ref(getSingleMood(props.record.mood))
const excerpt = ref(toPlainText(props.record.content, 90))
</script>

<template>
  <Card
    class="record-item cursor-pointer h-full"
    :bordered="false"
    hoverable
    @click="emits('open', record)"
  >
    <template #cover>
      <div v-if="record.cover" class="overflow-hidden" style="height: 168px">
        <img
          :src="spliceImgUrl(record.cover)"
          alt="封面"
          class="w-full h-full object-cover"
        />
      </div>
    </template>

    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between gap-8">
        <span class="text-15px font-semibold truncate">{{ record.title }}</span>
        <span
          v-if="mood"
          class="flex-shrink-0 text-13px"
          :style="{ color: mood.color }"
        >
          {{ mood.emoji }} {{ mood.label }}
        </span>
      </div>

      <div class="text-12px" style="color: var(--text-secondary)">
        {{ toDateKey(record.life_date) }}
      </div>

      <div
        class="text-13px leading-22"
        style="color: var(--text-secondary); min-height: 44px"
      >
        {{ excerpt || '（暂无正文）' }}
      </div>
    </div>
  </Card>
</template>

<style scoped>
.record-item {
  background: var(--surface);
  box-shadow: var(--shadow-card);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.record-item:hover {
  transform: translateY(-2px);
}
</style>
