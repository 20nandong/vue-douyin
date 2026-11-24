import { ref, type Ref } from 'vue'

/**
 * 播放控制：播放 / 暂停 / 就绪状态 / 播放错误。
 * 只操作传进来的 <video> 元素。
 */
export function useVideoPlayer(
  videoRef: Ref<HTMLVideoElement | null>,
  onPlaybackError?: (message: string) => void,
) {
  const isPlaying = ref(true)
  const videoReady = ref(false)

  function play() {
    const el = videoRef.value
    if (!el) return
    el.play()
      .then(() => {
        isPlaying.value = true
      })
      .catch((e) => {
        // 浏览器的自动播放策略会拦下带声音的自动播放，这里不当作错误
        console.warn('自动播放被阻止:', e)
      })
  }

  function pause() {
    videoRef.value?.pause()
    isPlaying.value = false
  }

  function togglePlay() {
    const el = videoRef.value
    if (!el) return
    if (el.paused) {
      el.play()
      isPlaying.value = true
    } else {
      el.pause()
      isPlaying.value = false
    }
  }

  function onLoadedData() {
    videoReady.value = true
  }

  function onPlay() {
    isPlaying.value = true
  }

  function onPause() {
    isPlaying.value = false
  }

  function onError() {
    videoReady.value = false
    onPlaybackError?.('视频加载失败，请检查网络')
  }

  /** 切换视频源时调用，把"就绪"打回未就绪，让 loading 提示能重新出现 */
  function resetPlaybackState() {
    videoReady.value = false
  }

  return {
    isPlaying,
    videoReady,
    play,
    pause,
    togglePlay,
    onLoadedData,
    onPlay,
    onPause,
    onError,
    resetPlaybackState,
  }
}
