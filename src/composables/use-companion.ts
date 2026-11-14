interface Live2dTips {
  notify: (text: string) => Promise<void>
}

interface Live2dController {
  tips?: Live2dTips
  destroy?: () => void
}

let controller: Live2dController | null = null

export function registerCompanion(instance: Live2dController | null) {
  controller = instance
}

/** 让看板娘说一句话（未加载时静默跳过） */
export function companionSay(text: string, delay = 0) {
  if (!controller?.tips) return
  const run = () => {
    controller?.tips?.notify(text).catch(() => undefined)
  }
  if (delay > 0) setTimeout(run, delay)
  else run()
}

export function useCompanion() {
  return { registerCompanion, companionSay }
}
