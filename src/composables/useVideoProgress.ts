import { computed, ref, type Ref } from 'vue'

/**
 * 快进/快退的步长：先按视频总时长的 10% 算，再夹在 [3s, 7s] 之间。
 *
 * 为什么要有上下限：
 * - 短视频（本项目 20~40 秒）：10% 只有 2~4 秒，没问题；
 * - 长视频（比如 10 分钟）：10% 是 60 秒，按一下直接跳走一分钟，太粗了 → 封顶 7 秒；
 * - 极短的片子：10% 可能不到 1 秒，按了像没反应 → 保底 3 秒。
 *
 * 三个常量都可以单独改，不影响逻辑。
 */
export const SEEK_STEP_RATIO = 0.1
export const SEEK_STEP_MIN_SECONDS = 3
export const SEEK_STEP_MAX_SECONDS = 7

/** 算出这条视频一次该跳多少秒（纯函数，方便单独验证） */
export function getSeekStepSeconds(duration: number) {
  const raws = duration * SEEK_STEP_RATIO
  return Math.min(SEEK_STEP_MAX_SECONDS, Math.max(SEEK_STEP_MIN_SECONDS, raws))
}

/**
 * 播放进度：总时长、当前时间、进度百分比、点击进度条跳转、快退/快进。
 */
export function useVideoProgress(videoRef: Ref<HTMLVideoElement | null>) {
  const duration = ref(0)
  const currentTime = ref(0)

  const percent = computed(() =>
    duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
  )

  /** 元数据加载完才有总时长 */
  function onLoadedMetadata() {
    duration.value = videoRef.value?.duration ?? 0
  }

  function onTimeUpdate() {
    const el = videoRef.value
    if (!el) return
    currentTime.value = el.currentTime
  }

  /**
   * 跳转到指定比例位置
   * @param ratio 0 ~ 1 之间的比例（由进度条组件算好再传进来）
   */
  function seek(ratio: number) {
    const el = videoRef.value
    if (!el || duration.value <= 0) return
    const clamped = Math.max(0, Math.min(1, ratio))
    el.currentTime = clamped * duration.value
  }

  /** 切换视频时清零 */
  function resetProgress() {
    duration.value = 0
    currentTime.value = 0
  }

  /**
   * 按秒数前后移动（a / d、左右方向键用）。
   * 两端都夹紧在 [0, duration]，所以倒退回开头不会变成负数，
   * 快进到结尾也不会溢出（currentTime 超过时长会让浏览器把 video 置为 error）。
   */
  function seekBySeconds(delta: number) {
    const el = videoRef.value
    if (!el || duration.value <= 0) return

    // 留 0.05s 余量，避免刚好落在 duration 上直接触发 ended
    const upper = Math.max(0, duration.value - 0.05)
    el.currentTime = Math.min(upper, Math.max(0, el.currentTime + delta))
    currentTime.value = el.currentTime
  }

  /** 在当前进度上前后移动一段比例 */
  function seekByRatio(delta: number) {
    const el = videoRef.value
    if (!el || duration.value <= 0) return

    const currentRatio = el.currentTime / duration.value
    const nextRatio = Math.min(1, Math.max(0, currentRatio + delta))
    el.currentTime = nextRatio * duration.value
    currentTime.value = el.currentTime
  }

  /** 快进一小段（d / → 键）：按视频时长算 10%，夹在 3~7 秒之间 */
  function seekForward() {
    seekBySeconds(getSeekStepSeconds(duration.value))
  }

  /** 快退一小段（a / ← 键） */
  function seekBackward() {
    seekBySeconds(-getSeekStepSeconds(duration.value))
  }

  return {
    duration,
    currentTime,
    percent,
    onLoadedMetadata,
    onTimeUpdate,
    seek,
    seekBySeconds,
    seekByRatio,
    seekForward,
    seekBackward,
    resetProgress,
  }
}
