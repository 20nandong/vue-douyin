import { computed, ref, type Ref } from 'vue'

/**
 * 播放进度：总时长、当前时间、进度百分比、点击进度条跳转。
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

  return {
    duration,
    currentTime,
    percent,
    onLoadedMetadata,
    onTimeUpdate,
    seek,
    resetProgress,
  }
}
