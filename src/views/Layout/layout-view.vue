<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Button, Drawer } from 'ant-design-vue'
import { useMediaQuery } from '@vueuse/core'
import dayjs from 'dayjs'
import { wlLive2d } from 'wl-live2d'
import type { DLive2dOptions } from 'wl-live2d'
import Aside from '@/views/Layout/components/layout-aside.vue'
import GlobalSearch from '@/components/global-search.vue'
import { useSettingsStore } from '@/stores/settings-store'
import { usePlanStore } from '@/stores/plan-store'
import { useLifeStore } from '@/stores/life-store'
import { registerCompanion, companionSay } from '@/composables/use-companion'
import { toDateKey } from '@/utils/stats'

const settings = useSettingsStore()
const planStore = usePlanStore()
const lifeStore = useLifeStore()
const isMobile = useMediaQuery('(max-width: 768px)')

const drawerOpen = ref(false)
const searchRef = ref<{ open: () => void } | null>(null)

let live2d: ReturnType<typeof wlLive2d> | null = null

const GREETING_KEY = 'grove:last-greeting'
const CONGRATS_KEY = 'grove:last-congrats'

function greetingText(total: number, undone: number) {
  const hour = dayjs().hour()
  const hello =
    hour < 6
      ? '这么晚还在忙，记得早点休息～'
      : hour < 12
        ? '早上好，今天想先做哪件小事？'
        : hour < 18
          ? '下午好，别忘了给自己留点喘息时间。'
          : '晚上好，今天过得怎么样？'
  if (total === 0) return `${hello}今天还没有安排任务哦。`
  if (undone === 0) return `${hello}今天的任务都完成了，厉害！`
  return `${hello}今天还有 ${undone} 件事没完成，慢慢来。`
}

function initLive2d() {
  if (live2d) return
  try {
    live2d = wlLive2d({
      models: [
        {
          path: '/live2d/Hiyori/Hiyori.model3.json',
          position: { x: 0, y: 0 }
        }
      ],
      tips: {
        drag: true,
        duration: 4000,
        talk: false,
        message: []
      },
      menus: ['home', 'switchTexture', 'capture', 'quit']
    } as unknown as DLive2dOptions)
    registerCompanion(live2d)
  } catch (error) {
    console.warn('[live2d] 初始化失败', error)
  }
}

function destroyLive2d() {
  registerCompanion(null)
  try {
    live2d?.destroy()
  } catch {
    // 组件库销毁时可能抛错，忽略
  }
  live2d = null
}

async function greet() {
  await Promise.all([planStore.fetchPlans(), lifeStore.fetchRecords()])
  if (!settings.showLive2d.value || isMobile.value || !live2d) return

  const todayKey = toDateKey(dayjs())
  const todayList = planStore.plansOf(todayKey)
  const undone = todayList.filter((item) => !item.is_completed).length

  if (localStorage.getItem(GREETING_KEY) !== todayKey) {
    localStorage.setItem(GREETING_KEY, todayKey)
    companionSay(greetingText(todayList.length, undone), 1500)
    return
  }
  if (
    todayList.length > 0 &&
    undone === 0 &&
    localStorage.getItem(CONGRATS_KEY) !== todayKey
  ) {
    localStorage.setItem(CONGRATS_KEY, todayKey)
    companionSay('今天的任务全部完成，辛苦啦！', 1200)
  }
}

watch(
  [() => settings.showLive2d.value, isMobile],
  ([show, mobile]) => {
    if (show && !mobile) initLive2d()
    else destroyLive2d()
  },
  { immediate: true }
)

onMounted(() => {
  void greet()
})

onUnmounted(() => {
  destroyLive2d()
})
</script>

<template>
  <div class="h-full flex" style="background: var(--app-bg)">
    <div v-if="!isMobile" class="flex-shrink-0 w-256 border-r">
      <Aside @search="searchRef?.open()" @navigate="drawerOpen = false" />
    </div>

    <div class="flex-1 flex flex-col min-w-0">
      <header
        v-if="isMobile"
        class="flex items-center gap-8 px-12 py-8 border-b"
        style="background: var(--surface); border-color: var(--border-color)"
      >
        <Button type="text" @click="drawerOpen = true">
          <i-mdi-menu class="w-22 h-22" />
        </Button>
        <div class="flex-1 text-16px font-semibold">成长篇</div>
        <Button type="text" @click="searchRef?.open()">
          <i-mdi-magnify class="w-22 h-22" />
        </Button>
        <Button type="text" @click="settings.toggleTheme()">
          <i-mdi-theme-light-dark class="w-22 h-22" />
        </Button>
      </header>

      <main
        class="flex-1 overflow-y-auto"
        :class="isMobile ? 'px-12 py-12' : 'px-40 py-24'"
      >
        <router-view />
      </main>
    </div>

    <Drawer
      v-model:open="drawerOpen"
      placement="left"
      :width="248"
      :closable="false"
      :body-style="{ padding: '0' }"
    >
      <Aside @search="searchRef?.open()" @navigate="drawerOpen = false" />
    </Drawer>

    <GlobalSearch ref="searchRef" />
  </div>
</template>
