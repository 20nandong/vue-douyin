import { ossProvider } from '@/providers/ossProvider'
import { pexelsProvider } from '@/providers/pexelsProvider'
import type { VideoItem, VideoProvider, VideoSourceKey } from '@/types/video'

/**
 * 视频接口的唯一出口。
 *
 * 页面 / composable 只应该 import 这里的 getVideos()，
 * 永远不要直接 import 某个 provider —— 这样换数据源、
 * 或者将来换成 Java 后端接口，都只改这一个文件。
 */

const providers: Record<VideoSourceKey, VideoProvider> = {
  oss: ossProvider,
  pexels: pexelsProvider,
}

const requested = import.meta.env.VITE_VIDEO_SOURCE as VideoSourceKey | undefined

/** 当前生效的视频源，由 .env 里的 VITE_VIDEO_SOURCE 决定，默认 oss */
export const ACTIVE_VIDEO_SOURCE: VideoSourceKey =
  requested && requested in providers ? requested : 'oss'

/**
 * 拉取视频列表。
 *
 * 将来接 Java 后端时，这里换成：
 *   const { data } = await http.get<VideoItem[]>('/videos', { params: { page, perPage } })
 *   return data
 * 其余代码一行都不用动。
 */
export function getVideos(page = 1, perPage = 10): Promise<VideoItem[]> {
  return providers[ACTIVE_VIDEO_SOURCE].fetchVideos(page, perPage)
}
