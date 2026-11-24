# vue-douyin

仿抖音 PC 网页版的前端项目，用来练习 Vue 3 工程化：组件拆分、组合式函数、策略模式与 CI 部署。

在线预览：<https://20nandong.github.io/vue-douyin/>

> 本项目仅用于个人学习与技术练习，与抖音官方无关。站名与 LOGO 版权归字节跳动所有，不得用于商业用途。

## 功能

已完成

- 左侧导航栏 + 顶部搜索栏 + 中间竖屏播放器的整体布局
- 竖屏视频播放：自动播放（静音起播）、播放/暂停、音量调节、全屏、可拖拽进度条
- 上一条 / 下一条切换，右侧点赞、评论、收藏、分享图标位
- 视频源可切换：阿里云 OSS 直链（默认）/ Pexels，通过环境变量选择，无需改代码
- GitHub Actions 自动构建并部署到 GitHub Pages

未完成（规划中）

- 登录注册、点赞、评论、收藏等真实交互（右侧图标目前是纯装饰）
- 后端接口与数据库（计划用 Java + Spring Boot + MySQL）
- 搜索、分页 / 无限流、键盘快捷键、移动端适配

## 技术栈

| 用途 | 选型 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>` + Composition API） |
| 构建 | Vite 8 + Rolldown |
| 语言 | TypeScript，`vue-tsc` 做类型检查 |
| 路由 | vue-router 5，hash 模式 |
| UI | Element Plus（全量注册） |
| 请求 | axios |
| 样式 | SCSS + Less |
| 代码检查 | oxlint + ESLint |

## 目录结构

```
src/
├── main.ts                  # 应用入口：router、Element Plus、iconfont
├── App.vue                  # 全局重置样式
├── router/index.ts          # 路由表
├── types/video.ts           # VideoItem / VideoProvider 类型定义
├── api/video.ts             # 视频数据唯一出口 getVideos()
├── providers/               # 视频源适配器
│   ├── ossProvider.ts       #   阿里云 OSS 直链
│   └── pexelsProvider.ts    #   Pexels API
├── composables/             # 播放页逻辑，每个只管一件事
│   ├── useVideoList.ts      #   列表与上/下切换
│   ├── useVideoPlayer.ts    #   播放控制
│   ├── useVideoProgress.ts  #   进度与拖拽
│   ├── useVolume.ts         #   音量与静音
│   └── useFullscreen.ts     #   全屏
├── components/video/        # 播放页 UI 切片
│   ├── VideoControls.vue    #   音量、播放键、全屏、进度条
│   ├── SideActions.vue      #   右侧点赞/评论/收藏/分享
│   ├── VideoMeta.vue        #   左下角作者信息
│   └── SwipeNav.vue         #   上一条/下一条
└── views/
    ├── HomeView.vue         # 外壳：导航 + 搜索栏 + <router-view>
    ├── VideosView.vue       # 播放页，只负责编排
    └── BlockView.vue        # 未开发功能的占位页
```

分层约定：`composables` 只处理状态与 `<video>` 元素，`components/video` 是只接收 props、抛出 emits 的展示组件，`VideosView.vue` 负责把两者拼起来。新增功能请改对应的 composable 或组件，不要继续往页面文件里堆。

更详细的架构说明、数据流、踩坑记录与后端规划见 [AGENTS.md](./AGENTS.md)。

## 快速开始

环境要求：Node.js `^20.19.0` 或 `>=22.12.0`。

```bash
npm install
npm run dev        # http://localhost:3000
```

开发服务器端口固定为 3000 并开启 `strictPort`，被占用时会直接报错而不是自动换端口。

## 环境变量

复制 `.env.example` 为 `.env.local` 后按需填写。所有 `VITE_` 前缀的变量都会被打包进前端产物，等同公开，不能用来存放真正的密钥。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_VIDEO_SOURCE` | `oss` | 视频源：`oss` 或 `pexels` |
| `VITE_PEXELS_API_KEY` | 无 | 仅 `pexels` 源需要 |
| `VITE_API_BASE_URL` | 无 | 预留给将来的后端接口地址 |

### 切换视频源

```bash
# .env.local
VITE_VIDEO_SOURCE=pexels
VITE_PEXELS_API_KEY=your_key_here
```

新增视频源：在 `src/providers/` 下新建文件实现 `VideoProvider` 接口，再到 `src/api/video.ts` 的 `providers` 映射里注册一行即可，页面代码不需要改动。

## 构建与检查

```bash
npm run build      # 类型检查 + 生产构建，产物在 dist/
npm run preview    # 本地预览 dist
npm run lint       # oxlint + ESLint，带 --fix
npm run type-check # 仅类型检查
```

提交前请确保 `npm run build` 与 `npm run lint` 均通过。

## 部署

当前使用 GitHub Actions 部署到 GitHub Pages，推送到 `main` 自动触发，配置见 `.github/workflows/deploy.yml`。

`vite.config.ts` 中生产环境的 `base` 为 `/vue-douyin`，与仓库名对应。如果改用 Vercel 等根路径部署，必须把 `base` 改成 `/`，否则静态资源会全部 404 并导致白屏。

视频文件存放在阿里云 OSS，浏览器直接通过公网链接拉取，不经过任何应用服务器转发。

## License

仅用于学习交流。
