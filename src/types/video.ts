/**
 * 全站统一的视频数据结构。
 *
 * 不管数据来自阿里云 OSS、Pexels，还是将来的 Java 后端，
 * 都必须被各自的 provider 转换成这个形状再交给页面，
 * 页面只认 VideoItem，不关心数据从哪来。
 */

/** 视频源标识 */
export type VideoSourceKey = 'oss' | 'pexels'

/** 单个视频文件（一条视频可能有多个码率，当前只取第一个） */
export interface VideoFile {
  link: string
  quality?: string
  file_type?: string
  width?: number
  height?: number
}

/** 视频作者 */
export interface VideoAuthor {
  name: string
  url?: string
}

/** 一条视频 */
export interface VideoItem {
  id: number | string
  user: VideoAuthor
  /** 至少包含一个可播放地址 */
  video_files: VideoFile[]
  /** 封面图，没有就是空字符串 */
  image?: string
  /** 这条数据来自哪个源，便于调试 */
  sourceType?: VideoSourceKey
}

/** 所有视频源都必须实现的接口 */
export interface VideoProvider {
  name: VideoSourceKey
  fetchVideos(page: number, perPage: number): Promise<VideoItem[]>
}
