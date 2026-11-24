import type { VideoItem, VideoProvider } from '@/types/video'

/**
 * 阿里云 OSS 视频源。
 *
 * 这些视频文件直接放在 OSS 上，浏览器拿公网直链播放，
 * 不经过任何后端服务。是目前线上实际使用的数据源。
 *
 * 以后接了 Java 后端，这个文件可以整体删掉，
 * 前端改成调用后端的分页接口即可（见 src/api/video.ts）。
 */
const OSS_VIDEOS: VideoItem[] = [
  {
    id: 1,
    sourceType: 'oss',
    user: { name: '视频1' },
    image: '',
    video_files: [
      {
        link: 'https://videos-vue.oss-cn-chengdu.aliyuncs.com/video_%E8%BF%99%E4%B9%88%E7%9C%8B%E6%9D%A5%E9%BB%91%E6%B5%B7%E5%B2%B8%E7%9A%84%E5%BF%A7%E9%83%81%E7%A8%8B%E5%BA%A6%E5%BA%94%E8%AF%A5%E5%9C%A8%E6%88%91..._0.mp4',
      },
    ],
  },
  {
    id: 2,
    sourceType: 'oss',
    user: { name: '视频2' },
    image: '',
    video_files: [
      {
        link: 'https://videos-vue.oss-cn-chengdu.aliyuncs.com/%E6%88%91%E6%83%B3_%E4%BC%A6%E6%95%A6%E6%88%96%E8%AE%B8%E9%80%82%E5%90%88%E4%B8%A4%E4%B8%AA%E4%BA%BA%E6%9D%A5_%E6%88%91%E7%9A%84%E6%84%8F%E6%80%9D%E6%98%AF%E6%88%91%E4%BB%AC%E8%A7%81%E9%9D%A2%E5%90%A7_%E8%8B%B1%E5%9B%BD_%E4%BC%A6%E6%95%A6_%E6%9C%BA%E4%BD%8D%E5%A4%A9%E6%89%8D%E5%B7%B2%E5%B0%B1%E4%BD%8D_%E5%A5%BD%E4%B9%85%E6%B2%A1%E8%A7%81_%E6%A2%85%E8%A7%81.mp4',
      },
    ],
  },
  {
    id: 3,
    sourceType: 'oss',
    user: { name: '视频3' },
    image: '',
    video_files: [
      {
        link: 'https://videos-vue.oss-cn-chengdu.aliyuncs.com/%E8%8B%A6%E5%8A%9B%E6%80%95%E5%A8%98%E5%92%8C%E6%9C%AB%E5%BD%B1%E5%A5%B3%E7%8E%8B%E6%80%8E%E4%B9%88%E9%80%89_%E6%88%91%E7%9A%84%E4%B8%96%E7%95%8C_minecraft_mc_%E6%96%87%E8%89%BA%E5%A4%8D%E5%85%B4%E6%88%91%E7%9A%84%E4%B8%96%E7%95%8C%E5%8A%A8%E7%94%BB.mp4',
      },
    ],
  },
  {
    id: 4,
    sourceType: 'oss',
    user: { name: '视频4' },
    image: '',
    video_files: [
      {
        link: 'https://videos-vue.oss-cn-chengdu.aliyuncs.com/%E7%99%BE%E5%90%A8%E7%8E%8B_%E5%8D%B1%E9%99%A9%E5%8A%A8%E4%BD%9C%E8%AF%B7%E5%8B%BF%E6%A8%A1%E4%BB%BF_%E9%99%95%E6%B1%BD%E5%BE%B7%E9%BE%99_%E7%BB%84%E5%90%88%E6%8A%80%E5%90%97%E6%9C%89%E7%82%B9%E6%84%8F%E6%80%9D.mp4',
      },
    ],
  },
  {
    id: 5,
    sourceType: 'oss',
    user: { name: '视频5' },
    image: '',
    video_files: [
      {
        link: 'https://videos-vue.oss-cn-chengdu.aliyuncs.com/video_%E9%81%87%E5%88%B0%E6%88%91_%E5%B0%B1%E7%AE%97%E6%98%AF%E9%98%8E%E7%8E%8B%E4%B9%9F%E8%A6%81%E5%8F%AB%E5%A3%B0%E7%88%B7%E7%88%B7%E9%BD%90..._0.mp4',
      },
    ],
  },
  {
    id: 6,
    sourceType: 'oss',
    user: { name: '视频6' },
    image: '',
    video_files: [
      {
        link: 'https://videos-vue.oss-cn-chengdu.aliyuncs.com/%E9%BB%8E%E6%98%8E%E6%97%B6%E5%88%86%E7%9A%84%E9%98%B3%E5%85%89%E6%80%BB%E8%83%BD%E5%94%A4%E9%86%92%E6%88%91%E6%B2%89%E7%9D%A1%E7%9A%84%E7%81%B5%E9%AD%82_%E9%98%B3%E5%85%89%E9%AB%98%E6%9E%B6%E6%A1%A5%E6%B8%85%E6%99%A8%E6%B2%BB%E6%84%88%E7%B3%BB.mp4',
      },
    ],
  },
  {
    id: 7,
    sourceType: 'oss',
    user: { name: '视频7' },
    image: '',
    video_files: [
      {
        link: 'https://videos-vue.oss-cn-chengdu.aliyuncs.com/%E4%BD%A0%E7%BB%99%E6%88%91%E7%AB%99%E4%BD%8F%E4%BA%AC%E5%89%A7%E8%8A%B1%E6%97%A6_%E4%B8%9C%E6%96%B9%E6%88%8F%E6%9B%B2%E8%A1%80%E8%84%89%E8%A7%89%E9%86%92_%E5%9B%BD%E6%BD%AE%E8%8A%B1%E6%97%A6_%E8%B0%81%E8%83%BD%E6%8B%92%E7%BB%9D%E4%BA%AC%E5%89%A7%E7%9A%84%E9%AD%85%E5%8A%9B.mp4',
      },
    ],
  },
  {
    id: 8,
    sourceType: 'oss',
    user: { name: '视频8' },
    image: '',
    video_files: [
      {
        link: 'https://videos-vue.oss-cn-chengdu.aliyuncs.com/%E8%BF%99%E4%B9%88%E5%B9%B4%E8%BD%BB_%E5%8F%88%E4%BD%95%E5%BF%85%E5%A4%AA%E6%89%A7%E7%9D%80%E5%91%A2_%E6%A2%81%E7%A5%9D_%E4%BA%86%E4%B8%8D%E8%B5%B7%E7%9A%84%E6%B7%B7%E5%89%AA%E5%9B%A2.mp4',
      },
    ],
  },
]

export const ossProvider: VideoProvider = {
  name: 'oss',
  async fetchVideos(_page, perPage) {
    // 本地固定列表，没有真正的分页；保留参数是为了符合 VideoProvider 接口
    return OSS_VIDEOS.slice(0, perPage)
  },
}
