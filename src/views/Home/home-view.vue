<script setup lang="ts">
import { Button, Card, DatePicker, Empty } from 'ant-design-vue'
import { getAllPlansApi, queryPlansByDateApi } from '@/apis'
import CreateTask from '@/views/Home/components/create-task.vue'
import PlanItem from '@/views/Home/components/plan-item.vue'
import dayjs, { Dayjs } from 'dayjs'
import type { PlanItemInfo } from '@/views/Home/type'

const nowDate = ref(dayjs())
const planList = ref<PlanItemInfo[]>([])

const createTaskRef = useTemplateRef<typeof CreateTask>('createTaskRef')
function openCreateTaskModal() {
  createTaskRef.value?.openModal()
}

async function handleDateChange(_: string | Dayjs, dateString: string) {
  console.log(dateString)
  try {
    const res = await queryPlansByDateApi(dateString)
    planList.value = res.data
  } catch (error) {
    console.log(error)
  }
}

async function getAllPlans() {
  try {
    const res = await getAllPlansApi()
    console.log(res)
    planList.value = res.data
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  const dateString = dayjs().format('YYYY-MM-DD')
  await handleDateChange(dateString, dateString)
})
</script>

<template>
  <div class="home">
    <header
      class="home-header flex justify-between items-center bg-white p-16 rounded-10">
      <div class="home-header-title flex gap-20 items-center leading-48">
        <img src="@/assets/happy.svg" alt="开心" class="h-48" />
        <div class="font-24 font-bold theme-color">开心每一天</div>
      </div>
      <Button type="primary" @click="openCreateTaskModal">添加任务</Button>
    </header>

    <main class="home-main p-24">
      <Card hoverable>
        <template #title>
          <div class="flex items-center justify-between gap-10 py-10">
            <div class="flex items-center gap-10">
              <i-mdi-calendar-month class="w-36 h-36" />
              <div>{{ dayjs(nowDate).format('YYYY-MM-DD') }} 的任务</div>
            </div>
            <div class="flex items-center gap-10">
              <DatePicker
                v-model:value="nowDate"
                placeholder="请选择开始时间"
                @change="handleDateChange" />
            </div>
          </div>
        </template>

        <template v-if="planList.length">
          <div class="plan-list flex flex-col gap-10">
            <plan-item
              v-for="item in planList"
              :key="item.id"
              :plan-item="item"
              @refresh="getAllPlans" />
          </div>
        </template>

        <template v-else>
          <Empty
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="今天都没有待办任务喔～"></Empty>
          <div class="flex-center">
            <Button type="primary" @click="openCreateTaskModal">
              添加任务
            </Button>
          </div>
        </template>
      </Card>
    </main>

    <CreateTask ref="createTaskRef" @refresh="getAllPlans" />
  </div>
</template>

<style scoped lang="scss">
.home-header {
  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 8px;
}
</style>
