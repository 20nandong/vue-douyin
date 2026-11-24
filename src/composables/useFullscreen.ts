import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * 全屏控制。作用于传入的容器元素（不是整个页面），
 * 这样全屏后只有播放区放大，侧边栏不会跟着变。
 */
export function useFullscreen(targetRef: Ref<HTMLElement | null>) {
  const isFullscreen = ref(false)

  function syncState() {
    isFullscreen.value = !!document.fullscreenElement
  }

  function toggleFullscreen() {
    if (!targetRef.value) return
    if (!document.fullscreenElement) {
      targetRef.value.requestFullscreen().catch((err) => {
        console.warn('全屏失败:', err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  onMounted(() => document.addEventListener('fullscreenchange', syncState))
  onUnmounted(() => document.removeEventListener('fullscreenchange', syncState))

  return { isFullscreen, toggleFullscreen }
}
