<script setup lang="ts">
import RecordIcon from '@/assets/record.svg'
import MainHeader from '@/components/main-header.vue'
import CreateRecord from '@/views/LifeRecord/components/create-record.vue'

const createRecordRef = templateRef('createRecordRef')

function openCreateRecord() {
  console.log('打开添加日志')
  createRecordRef.value?.openDrawer()
}
</script>

<template>
  <div class="life-container">
    <main-header
      :icon="RecordIcon"
      title="生活滴滴点点"
      button-text="添加日志"
      @button-click="openCreateRecord" />
    <main>
      <div>生活日志</div>
    </main>

    <create-record ref="createRecordRef" />
  </div>
</template>

<style scoped lang="scss"></style>
