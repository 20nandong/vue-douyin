import axios from 'axios'
import type { VideoItem, VideoProvider } from '@/types/video'

/**
 * Pexels 视频源（国外免费素材站，国内访问较慢）。
 *
 * 只作为备选源保留，默认不启用。
 * 启用方式：在 .env.local 里设置
 *   VITE_VIDEO_SOURCE=pexels
 *   VITE_PEXELS_API_KEY=你的key
 *
 * 注意：任何 VITE_ 开头的变量都会被打包进前端产物，
 * 所以这个 key 只在本地开发/个人 demo 场景下可用，
 * 真正对外发布时应改由后端代理请求 Pexels。
 */

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY ?? ''

const pexelsClient = axios.create({
  baseURL: 'https://api.pexels.com/videos',
  timeout: 8000,
  headers: { Authorization: API_KEY },
})

interface PexelsRawFile {
  link?: string
  quality?: string
  file_type?: string
  width?: number
  height?: number
}

interface PexelsRawVideo {
  id: number
  image?: string
  user?: { name?: string; url?: string }
  video_files?: PexelsRawFile[]
}

export const pexelsProvider: VideoProvider = {
  name: 'pexels',
  async fetchVideos(page, perPage) {
    if (!API_KEY) {
      throw new Error('缺少 VITE_PEXELS_API_KEY，无法使用 Pexels 视频源')
    }

    const { data } = await pexelsClient.get<{ videos?: PexelsRawVideo[] }>('/search', {
      params: { query: 'nature', page, per_page: perPage },
    })

    return (data.videos ?? []).map<VideoItem>((raw) => ({
      id: raw.id,
      sourceType: 'pexels',
      user: {
        name: raw.user?.name ?? '未知用户',
        url: raw.user?.url,
      },
      image: raw.image ?? '',
      video_files: (raw.video_files ?? [])
        .filter((file) => !!file.link)
        .map((file) => ({
          link: file.link as string,
          quality: file.quality,
          file_type: file.file_type,
          width: file.width,
          height: file.height,
        })),
    }))
  },
}
