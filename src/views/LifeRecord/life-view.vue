<script setup lang="ts">
import { getLifeRecordListApi } from '@/apis/lifeRecord.ts'
import type { LifeRecordItem } from '@/types'
import RecordIcon from '@/assets/record.svg'
import MainHeader from '@/components/main-header.vue'
import CreateRecord from '@/views/LifeRecord/components/create-record.vue'
import RecordItem from '@/views/LifeRecord/components/record-item.vue'

const createRecordRef = templateRef('createRecordRef')
const recordList = ref<LifeRecordItem[]>([])

function openCreateRecord() {
  console.log('打开添加日志')
  createRecordRef.value?.openDrawer()
}

async function getRecordList() {
  try {
    const res = await getLifeRecordListApi()
    recordList.value = res.data || []
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await getRecordList()
})
</script>

<template>
  <div class="life-container">
    <main-header
      :icon="RecordIcon"
      title="生活滴滴点点"
      button-text="添加日志"
      @button-click="openCreateRecord"
    />
    <main
      class="grid mt-20"
      style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))"
    >
      <record-item v-for="item in recordList" :key="item.id" :record="item" />
    </main>

    <create-record ref="createRecordRef" />
  </div>
</template>

<style scoped lang="scss"></style>
