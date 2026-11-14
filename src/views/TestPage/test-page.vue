<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Input } from 'ant-design-vue'

type EffectFn = () => void

const logs = ref<string[]>([])

function pushLog(text: string) {
  logs.value = [...logs.value, text]
}

/* ---------------- 1. 手写响应式：Proxy + 依赖收集 ---------------- */
const targetMap = new WeakMap<object, Map<PropertyKey, Set<EffectFn>>>()
const proxyCache = new WeakMap<object, object>()
const proxySet = new WeakSet<object>()
let activeEffect: EffectFn | null = null

function track(target: object, key: PropertyKey) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let effects = depsMap.get(key)
  if (!effects) {
    effects = new Set()
    depsMap.set(key, effects)
  }
  effects.add(activeEffect)
}

function trigger(target: object, key: PropertyKey) {
  targetMap.get(target)?.get(key)?.forEach((fn) => fn())
}

function customReactive<T extends object>(raw: T): T {
  const cached = proxyCache.get(raw)
  if (cached) return cached as T
  if (proxySet.has(raw)) return raw

  const proxy = new Proxy(raw, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const ok = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return ok
    }
  })

  proxyCache.set(raw, proxy)
  proxySet.add(proxy)
  return proxy
}

function effect(fn: EffectFn) {
  activeEffect = fn
  fn()
  activeEffect = null
}

const state = customReactive({ count: 0 })

effect(() => {
  pushLog(`依赖触发：count = ${state.count}`)
})

function increment() {
  state.count += 1
}

/* ---------------- 2. 防抖 ---------------- */
function debounce<F extends (...args: never[]) => void>(
  fn: F,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const keyword = ref('')
const debouncedValue = ref('')

const handleInput = debounce((value: string) => {
  debouncedValue.value = value
  pushLog(`防抖 600ms 后输出：${value || '(空)'}`)
}, 600)

function onKeywordInput() {
  handleInput(keyword.value)
}

/* ---------------- 3. 并发限制 ---------------- */
function createLimiter(limit: number) {
  const queue: Array<() => void> = []
  let active = 0

  return function <T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const start = () => {
        active += 1
        task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            active -= 1
            const next = queue.shift()
            if (next) next()
          })
      }
      if (active < limit) start()
      else queue.push(start)
    })
  }
}

const limiter = createLimiter(2)

function delayTask(label: string, duration: number) {
  return () =>
    new Promise<string>((resolve) => {
      pushLog(`开始 ${label}`)
      setTimeout(() => {
        pushLog(`完成 ${label}`)
        resolve(label)
      }, duration)
    })
}

async function runLimitDemo() {
  pushLog('并发限制 2，提交 5 个任务')
  await Promise.all(
    ['A', 'B', 'C', 'D', 'E'].map((label, index) =>
      limiter(delayTask(label, 700 + index * 150))
    )
  )
  pushLog('5 个任务全部完成')
}

function clearLogs() {
  logs.value = []
}
</script>

<template>
  <div class="flex flex-col gap-16">
    <Card :bordered="false" title="手写响应式（Proxy + 依赖收集）">
      <div class="flex items-center gap-12 flex-wrap">
        <Button type="primary" @click="increment">count + 1</Button>
        <span class="text-13px">当前 count：{{ state.count }}</span>
        <span class="text-12px" style="color: var(--text-secondary)">
          每次修改都会触发依赖，日志见下方
        </span>
      </div>
    </Card>

    <Card :bordered="false" title="防抖（600ms）">
      <div class="flex items-center gap-12 flex-wrap">
        <Input
          v-model:value="keyword"
          class="max-w-260"
          placeholder="快速输入，停下来 600ms 后才输出"
          @update:value="onKeywordInput"
        />
        <span class="text-13px">防抖结果：{{ debouncedValue || '暂无' }}</span>
      </div>
    </Card>

    <Card :bordered="false" title="并发限制（同时最多 2 个）">
      <div class="flex items-center gap-12">
        <Button type="primary" @click="runLimitDemo">运行 5 个异步任务</Button>
        <Button @click="clearLogs">清空日志</Button>
      </div>
    </Card>

    <Card :bordered="false" title="运行日志">
      <div
        v-if="logs.length"
        class="flex flex-col gap-4 max-h-320 overflow-y-auto text-12px"
        style="color: var(--text-secondary)"
      >
        <div v-for="(item, index) in logs" :key="`${index}-${item}`">
          {{ index + 1 }}. {{ item }}
        </div>
      </div>
      <div v-else class="text-12px" style="color: var(--text-secondary)">
        暂无日志，点上面的按钮试试
      </div>
    </Card>
  </div>
</template>
