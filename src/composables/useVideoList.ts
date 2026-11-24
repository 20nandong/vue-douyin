import { computed, ref } from 'vue'
import { getVideos } from '@/api/video'
import type { VideoItem } from '@/types/video'

/**
 * 视频列表状态：负责拉数据、维护"当前第几条"、上下切换。
 * 不碰 <video> 元素，纯数据。
 */
export function useVideoList() {
  const videoList = ref<VideoItem[]>([])
  const currentIndex = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentVideo = computed<VideoItem | null>(
    () => videoList.value[currentIndex.value] ?? null,
  )
  const currentUrl = computed(() => currentVideo.value?.video_files[0]?.link ?? '')
  const currentPoster = computed(() => currentVideo.value?.image ?? '')

  async function load(page = 1, perPage = 10) {
    loading.value = true
    error.value = null
    try {
      videoList.value = await getVideos(page, perPage)
      currentIndex.value = 0
    } catch (e) {
      console.error('加载视频失败:', e)
      videoList.value = []
      error.value = '视频加载失败，请检查网络或 api 接口'
    } finally {
      loading.value = false
    }
  }

  /** 下一条，到底后回到第一条 */
  function next() {
    if (videoList.value.length === 0) return
    currentIndex.value = (currentIndex.value + 1) % videoList.value.length
  }

  /** 上一条，到顶后跳到最后一条 */
  function prev() {
    if (videoList.value.length === 0) return
    currentIndex.value = (currentIndex.value - 1 + videoList.value.length) % videoList.value.length
  }

  return {
    videoList,
    currentIndex,
    currentVideo,
    currentUrl,
    currentPoster,
    loading,
    error,
    load,
    next,
    prev,
  }
}
