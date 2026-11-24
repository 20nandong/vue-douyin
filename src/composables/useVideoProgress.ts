import { computed, ref, type Ref } from 'vue'

/**
 * 键盘 a / d 每次跳转的比例。
 * 改成 0.05 就是每次 5%，想做成"固定秒数"也只需要改 seekByRatio 的实现。
 */
export const SEEK_STEP_RATIO = 0.1

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
   * 在当前进度上前后移动一段比例（a / d 键用）。
   * 两端都夹紧在 0 ~ 1 之间，所以倒退回开头不会变成负数，
   * 快进到结尾也不会溢出（溢出会让浏览器把 video 置为 error）。
   */
  function seekByRatio(delta: number) {
    const el = videoRef.value
    if (!el || duration.value <= 0) return

    const currentRatio = el.currentTime / duration.value
    const nextRatio = Math.min(1, Math.max(0, currentRatio + delta))
    el.currentTime = nextRatio * duration.value
    currentTime.value = el.currentTime
  }

  /** 快进一小段（d 键） */
  function seekForward(ratio = SEEK_STEP_RATIO) {
    seekByRatio(ratio)
  }

  /** 快退一小段（a 键） */
  function seekBackward(ratio = SEEK_STEP_RATIO) {
    seekByRatio(-ratio)
  }

  return {
    duration,
    currentTime,
    percent,
    onLoadedMetadata,
    onTimeUpdate,
    seek,
    seekByRatio,
    seekForward,
    seekBackward,
    resetProgress,
  }
}
