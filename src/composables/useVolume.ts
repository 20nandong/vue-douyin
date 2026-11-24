import { ref, type Ref } from 'vue'

/**
 * 音量控制：滑块数值、静音开关、与 <video> 元素双向同步。
 *
 * 初始策略（保持原行为）：自动播放时强制静音，但 UI 上显示 50%，
 * 用户一动滑块就解除静音 —— 这是为了绕开浏览器的自动播放限制。
 */
export function useVolume(videoRef: Ref<HTMLVideoElement | null>) {
  const volumeLevel = ref(50)
  const isMuted = ref(false)
  /** 解静音时要恢复到多少，避免关掉静音后变成 0 */
  const previousVolume = ref(50)

  /** 首帧自动播放前调用：真静音，但不动 UI 数值 */
  function applyInitialMute() {
    const el = videoRef.value
    if (!el) return
    el.muted = true
    el.volume = 0
  }

  function toggleMute() {
    const el = videoRef.value
    if (!el) return

    isMuted.value = !isMuted.value

    if (isMuted.value) {
      previousVolume.value = volumeLevel.value || 50
      volumeLevel.value = 0
      el.muted = true
      el.volume = 0
    } else {
      const restore = previousVolume.value > 0 ? previousVolume.value : 50
      volumeLevel.value = restore
      el.muted = false
      el.volume = restore / 100
    }
  }

  /** 拖动滑块：先写入数值，再应用到 video 元素 */
  function setVolume(value: number) {
    const el = videoRef.value
    volumeLevel.value = value
    if (!el) return

    el.volume = value / 100

    if (value > 0) {
      el.muted = false
      isMuted.value = false
      previousVolume.value = value
    } else {
      el.muted = true
      isMuted.value = true
    }
  }

  /** 系统音量键/原生控件改了音量时，反向同步到 UI */
  function onVolumeChange() {
    const el = videoRef.value
    if (!el) return
    isMuted.value = el.muted || el.volume === 0
    if (!isMuted.value) {
      volumeLevel.value = Math.round(el.volume * 100)
    }
  }

  return {
    volumeLevel,
    isMuted,
    applyInitialMute,
    toggleMute,
    setVolume,
    onVolumeChange,
  }
}
