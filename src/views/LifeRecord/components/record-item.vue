<script setup lang="ts">
import type { LifeRecordItem } from '@/types'
import { spliceImgUrl } from '@/utils/spliceImgUrl.ts'
import { Card } from 'ant-design-vue'
import { getSingleMood } from '@/enums'

const props = defineProps<{
  record: LifeRecordItem
}>()

const recordMood = computed(() => {
  return getSingleMood(props.record.mood)
})
</script>

<template>
  <Card class="record-item max-w-320">
    <template #cover>
      <div class="p-20 pb-0">
        <img :src="spliceImgUrl(record.cover)" style="width: 100%" alt="封面" />
      </div>
    </template>

    <div class="content">
      <div class="title">
        <span>标题：</span>
        <span>{{ record.title }}</span>
      </div>

      <div class="mood">
        <span>心情：</span>
        <span :style="{ color: recordMood?.color }">
          {{ recordMood?.emoji }} {{ recordMood?.label }}
        </span>
      </div>

      <div class="记录时间">
        <span>记录时间：</span>
        <span>{{ record.life_date }}</span>
      </div>
      <div
        class="description max-h-100 overflow-y-scroll overflow-x-hidden break-all"
      >
        <span v-html="record.content"></span>
      </div>
    </div>
  </Card>
</template>

<style scoped lang="scss">
.record-item:hover {
  box-shadow:
    0 4px 8px 0 rgb(207 201 201 / 20%),
    0 6px 20px 0 rgba(159, 243, 234, 0.19);
}
.description {
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.description::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style>
