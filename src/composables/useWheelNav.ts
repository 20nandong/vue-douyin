import { onBeforeUnmount, watch, type Ref } from 'vue'

interface WheelNavOptions {
  /** 触发一次切换所需的最小滚动量，用来过滤触控板的高频抖动 */
  threshold?: number
  /** 两次切换之间的冷却时间(ms)，避免一次滚轮手势连跳好几条 */
  cooldown?: number
}

/**
 * 鼠标滚轮 / 触控板上下滑动切换视频，模拟抖音的滚动手势。
 *
 * 两个关键点：
 * 1. 只监听 target 元素（播放区），鼠标停在左侧导航或顶部搜索栏时不会误切；
 * 2. 用冷却时间把"一次手势"压成"一次切换"。滚轮一格、触控板一次滑动，
 *    浏览器都会连发很多个 wheel 事件，不挡住的话会一口气跳过好几条视频。
 */
export function useWheelNav(
  target: Ref<HTMLElement | null>,
  handlers: { onPrev: () => void; onNext: () => void },
  options: WheelNavOptions = {},
) {
  const { threshold = 8, cooldown = 480 } = options

  let locked = false
  let timer: ReturnType<typeof setTimeout> | undefined

  function onWheel(event: WheelEvent) {
    if (Math.abs(event.deltaY) < threshold) return
    // 页面本身不滚动，这里阻止默认行为是为了不让滚动链传到外层容器
    event.preventDefault()
    if (locked) return

    locked = true
    timer = setTimeout(() => {
      locked = false
    }, cooldown)

    if (event.deltaY > 0) handlers.onNext()
    else handlers.onPrev()
  }

  // 用 watch + onCleanup 而不是 onMounted，这样元素被重建时会自动重新挂载监听
  watch(
    target,
    (el, _oldEl, onCleanup) => {
      if (!el) return
      el.addEventListener('wheel', onWheel, { passive: false })
      onCleanup(() => el.removeEventListener('wheel', onWheel))
    },
    { immediate: true, flush: 'post' },
  )

  onBeforeUnmount(() => clearTimeout(timer))
}
