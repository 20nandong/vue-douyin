/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 视频数据源：oss（阿里云 OSS 直链）| pexels（Pexels 视频 API） */
  readonly VITE_VIDEO_SOURCE?: 'oss' | 'pexels'
  /** Pexels API Key，只放在 .env.local，绝不提交 */
  readonly VITE_PEXELS_API_KEY?: string
  /** 未来 Java 后端的基地址，例如 http://localhost:8080 */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
