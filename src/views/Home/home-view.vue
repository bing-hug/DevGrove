<script setup lang="ts">
import { Button, Card, DatePicker, Empty } from 'ant-design-vue'
import { queryPlansByDateApi } from '@/apis'
import CreateTask from '@/views/Home/components/create-task.vue'
import PlanItem from '@/views/Home/components/plan-item.vue'
import dayjs, { Dayjs } from 'dayjs'
import type { PlanItemInfo } from '@/views/Home/type'
import happyIcon from '@/assets/happy.svg'
import MainHeader from '@/components/main-header.vue'
import { defaultTaskList } from '@/views/Home/type'

const nowDate = ref(dayjs())
const planList = ref<PlanItemInfo[]>([])

const createTaskRef = useTemplateRef<typeof CreateTask>('createTaskRef')
function openCreateTaskModal() {
  createTaskRef.value?.openModal()
}

async function handleDateChange(_: string | Dayjs, dateString: string) {
  try {
    const res = await queryPlansByDateApi(dateString)
    planList.value = res.data
  } catch (error) {
    console.log(error)
  }
}

async function refreshPlans() {
  try {
    const dateString = dayjs().format('YYYY-MM-DD')
    await handleDateChange(dateString, dateString)
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await refreshPlans()
  if (planList.value.length === 0 && createTaskRef.value) {
    for (const params of defaultTaskList) {
      await createTaskRef.value.onCreateTask(params)
    }
    await refreshPlans()
  }
})
</script>

<template>
  <div class="home h-full flex flex-col">
    <main-header
      :icon="happyIcon"
      title="开心每一天"
      button-text="添加任务"
      @button-click="openCreateTaskModal"
    />

    <main class="home-main flex-1 overflow-y-scroll p-24">
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
                @change="handleDateChange"
              />
            </div>
          </div>
        </template>

        <template v-if="planList.length">
          <div class="plan-list flex flex-col gap-10">
            <plan-item
              v-for="item in planList"
              :key="item.id"
              :plan-item="item"
              @refresh="refreshPlans"
            />
          </div>
        </template>

        <template v-else>
          <Empty
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="今天都没有待办任务喔～"
          ></Empty>
          <div class="flex-center">
            <Button type="primary" @click="openCreateTaskModal">
              添加任务
            </Button>
          </div>
        </template>
      </Card>
    </main>

    <CreateTask ref="createTaskRef" @refresh="refreshPlans" />
  </div>
</template>

<style scoped lang="scss">
.home-main {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
