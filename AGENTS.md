# AGENTS.md — 仿抖音（vue-douyin）项目说明

> 给 AI 助手看的项目速读文档。修改代码前请先读完本文件。
> 最后更新：2026-11-24

---

## 1. 项目是什么

一个**纯前端的抖音 PC 网页版仿站**，用于练习 Vue 3 工程化。

- 界面：左侧导航栏 + 顶部搜索栏 + 中间竖屏视频播放器。
- 视频：文件放在**阿里云 OSS**，浏览器直接拿公网直链播放，**没有后端参与**。
- 现状：除"推荐"页外，其余导航项都指向占位页 `BlockView.vue`。
- 线上：GitHub Pages（`https://20nandong.github.io/vue-douyin/`），推送 `main` 自动部署。
- 合规定位：个人练习 / 作品集。站名与 LOGO 属抖音，不可作商业发布。

## 2. 技术栈

**实际在用的**

| 用途 | 选型 |
|---|---|
| 框架 | Vue 3.5（`<script setup>` + Composition API） |
| 构建 | Vite 8 + Rolldown |
| 语言 | TypeScript（`vue-tsc` 做类型检查） |
| 路由 | vue-router 5，**hash 模式**（`createWebHashHistory`） |
| UI | Element Plus（仅 `HomeView` 用了一个 `el-input` + `el-button`） |
| 请求 | axios（仅 `pexelsProvider` 用） |
| 样式 | SCSS（`<style scoped lang="scss">`）+ Less（`HomeView` 用 `lang="less"`） |
| 图标 | 内联 SVG + iconfont（`src/assets/iconfont/`，全局注册在 `main.ts`） |

**装了但当前没用到的**：`pinia`（未 `createPinia`）、`HomeIcon.vue`（未引用的图标合集）。
`lodash` / `swiper` / `xgplayer` 已于 2026-11-24 的重构中从依赖中移除。

## 3. 跑起来

```bash
npm install
npm run dev        # http://localhost:3000 （strictPort，端口被占用会直接失败）
npm run build      # 先 vue-tsc 类型检查，再 vite build
npm run preview    # 预览 dist
npm run lint       # oxlint + eslint
```

环境变量（`.env` 已提交，`.env.local` 不提交，见 `.env.example`）：

| 变量 | 说明 |
|---|---|
| `VITE_VIDEO_SOURCE` | `oss`（默认）或 `pexels`，决定用哪个视频源 |
| `VITE_PEXELS_API_KEY` | 仅 `pexels` 源需要；**只放 `.env.local`，绝不提交** |
| `VITE_API_BASE_URL` | 预留给未来的 Java 后端 |

## 4. 目录结构（每个文件干什么）

```
src/
├── main.ts                      # createApp + router + ElementPlus + iconfont
├── App.vue                      # 全局重置样式（* margin0、body 黑底、.icon 规则）
├── router/index.ts              # hash 路由；"/" 重定向到 "/tuijian"；其余导航全部指向 BlockView
│
├── types/video.ts               # ★ VideoItem / VideoFile / VideoProvider 类型，全站唯一真源
├── api/video.ts                 # ★ 视频接口唯一出口 getVideos()，按 VITE_VIDEO_SOURCE 选 provider
├── providers/
│   ├── ossProvider.ts           # 阿里云 OSS 直链，8 条视频硬编码在 OSS_VIDEOS
│   └── pexelsProvider.ts        # Pexels API，默认不启用
│
├── composables/                 # ★ 播放页的所有逻辑，每个只管一件事
│   ├── useVideoList.ts          # 拉列表、当前第几条、上/下切换（纯数据，不碰 DOM）
│   ├── useVideoPlayer.ts        # play / pause / togglePlay / videoReady / 播放错误
│   ├── useVideoProgress.ts      # duration / currentTime / percent / seek(ratio)
│   ├── useVolume.ts             # volumeLevel / isMuted / toggleMute / setVolume
│   └── useFullscreen.ts         # 对指定容器做全屏，监听 fullscreenchange
│
├── components/video/            # ★ 播放页的 UI 切片
│   ├── VideoControls.vue        # 音量面板 + 左下播放键 + 右下全屏 + 底部进度条（多根组件）
│   ├── SideActions.vue          # 右侧竖排：点赞/评论/收藏/分享（目前纯装饰）
│   ├── VideoMeta.vue            # 左下角作者名、作者主页、第 n / 总数
│   └── SwipeNav.vue             # 最右侧上一条/下一条按钮
│
├── views/
│   ├── HomeView.vue             # 外壳：左侧导航 + 顶部搜索栏 + <router-view>
│   ├── VideosView.vue           # ★ 播放页，只做"编排"，约 3xx 行（含样式）
│   └── BlockView.vue            # "功能尚未开发"占位页
│
└── assets/                      # 图片、iconfont
```

`★` = 核心文件，改功能基本都在这几个地方。

## 5. 播放页数据流（最重要）

```
VideosView.vue（唯一编排者）
   │
   ├── useVideoList ──> api/video.ts ──> providers/{oss|pexels}Provider
   │        └─ currentUrl 变化时 watch 触发 resetPlaybackState + resetProgress
   │
   ├── videoPlayer = ref<HTMLVideoElement>   ← 所有 player/progress/volume 的锚点
   │
   ├── useVideoPlayer(videoPlayer)    ← @loadeddata @play @pause @error @ended
   ├── useVideoProgress(videoPlayer)  ← @loadedmetadata @timeupdate
   ├── useVolume(videoPlayer)         ← @volumechange
   └── useFullscreen(videoContainer)  ← 作用于 .video-container
```

**职责边界（必须遵守）**

- `composables/*` 不写 DOM 结构、不写样式，只处理状态和 `<video>` 元素。
- `components/video/*` 是"哑组件"：状态靠 props 进，操作靠 emits 出，**不直接碰 `<video>`**。
- `VideosView.vue` 只负责把上面两者拼起来，**不应再增长**。加功能请改对应 composable / 组件。
- 任何页面都**不要直接 import provider**，只走 `@/api/video`。

## 6. 关键机制与坑

### 6.1 视频源切换（这套设计的目的）

历史问题：以前靠"注释掉一段代码、解开另一段"来切换 OSS / Pexels，两个实现无法共存。

现在改成策略模式：

```bash
# .env.local
VITE_VIDEO_SOURCE=pexels
VITE_PEXELS_API_KEY=xxxxx
```

新增一个源 = 在 `src/providers/` 加一个文件实现 `VideoProvider` 接口，然后在 `src/api/video.ts` 的 `providers` 对象里注册一行。**不需要动页面代码。**

### 6.2 自动播放为什么是静音的

浏览器禁止带声音的自动播放。所以 `VideosView.onMounted` 里先 `applyInitialMute()`（`muted=true, volume=0`）再 `play()`。

⚠️ 已知"看起来像 bug 但不是"的地方：**首屏 UI 显示音量 50%、图标是有声状态，实际是静音**。
这是刻意保留的旧行为——用户一动滑块就解除静音。改这里要一起改 `useVolume` 和 UI 显示，别只改一边。

### 6.3 全屏

`useFullscreen` 作用于 `.video-container`（不是 `document.body`），所以全屏后只有播放区放大。
注意布局大量使用 `vw/vh` 而非 `%`，全屏后自定义控件位置可能有偏差。

### 6.4 路由与部署路径

- 路由是 **hash 模式**，URL 形如 `#/tuijian`，为了在 GitHub Pages 上免配置。
- `vite.config.ts` 里 `base: mode === 'production' ? '/vue-douyin' : '/'`。
- ⚠️ **迁到 Vercel 必须把 `base` 改成 `/`**，否则所有静态资源 404、页面白屏。

### 6.5 安全

- **不要把任何密钥写进源码或注释。** 重构前的 `src/utils/requests.ts` 第 1 行曾明文写过 Pexels Key，已删除并（应）吊销。
- 所有 `VITE_` 前缀变量都会被打包进前端产物，等同于公开。真正的密钥只能放后端。
- 历史提交里可能仍残留旧密钥，因此**吊销旧 Key 比删代码更重要**。

## 7. 已知问题（尚未修，按优先级）

1. 单个视频加载失败会触发 `error`，而 `v-else-if="error"` 会把整个播放区替换成一行红字，体验差。应改为只在该视频上提示并自动跳下一条。
2. 切换视频只改 `:src`，**没有预加载下一条**，每次切换都要等。
3. `object-fit` 目前没生效（写在 `<video>` 属性上无效，CSS 里相关行被注释），视频是等比留黑边而非铺满。
4. 侧栏高亮 `curNav` 是 `HomeView` 内的 ref，`onMounted` 里硬写 `"推荐"`。刷新或直接访问 `#/wode` 时高亮错误。应从 `route.name` 派生。
5. `HomeView.vue` 有未使用变量（`searchBarStyle`、`toolbarWidth`），`cls_list` 应用 `const`；`BlockView.vue` / `HomeIcon.vue` / `shims-vue.d.ts` 有 lint 报错。`npm run lint` 目前不是全绿。
6. Element Plus 是**全量注册**（`app.use(ElementPlus)`），`index-*.js` 约 1MB，CSS 约 350KB。只为一个输入框付了这个代价，应改按需引入。
7. 没有键盘快捷键（↑↓ 切换、空格暂停）、没有移动端适配、没有错误边界。
8. 视频只有 8 条，靠 `% length` 无限循环，没有分页 / 无限流。

## 8. 后续方向（用户已确认）

技术路线：**前端 Vue 保持 + Vercel 部署；后端用 Java（Spring Boot）；数据库用 MySQL；视频继续放阿里云 OSS。**

### 8.1 后端要补的功能（按优先级）

1. 用户：注册 / 登录（JWT）、个人信息、关注 / 粉丝
2. 视频：分页列表、详情、播放量上报、上传（OSS STS 直传）、删除
3. 互动：点赞（幂等）、评论（含二级回复）、收藏、分享计数
4. 搜索：关键词搜视频 / 用户
5. 后台：视频审核、用户封禁

### 8.2 架构铁律

**后端不转发视频字节流。** 视频只有两种正确用法：
- 公共读：前端直接拿 OSS 公网 URL；
- 私有读：后端签发带过期时间的签名 URL / STS 直传凭证。

用 Spring Boot 代理视频流会瞬间打满带宽和 CPU。

### 8.3 最小表设计

```sql
user        (id, username, password_hash, nickname, avatar_url, bio, created_at)
video       (id, user_id, title, cover_url, play_url, duration, status, view_count, like_count, created_at)
video_like  (id, user_id, video_id, created_at)   -- UNIQUE(user_id, video_id)
comment     (id, video_id, user_id, parent_id, content, like_count, created_at)
favorite    (id, user_id, video_id)               -- UNIQUE(user_id, video_id)
follow      (id, follower_id, followee_id)        -- UNIQUE(follower_id, followee_id)
```

### 8.4 前端接入后端时怎么改

只改 `src/api/video.ts` 一个文件：

```ts
export async function getVideos(page = 1, perPage = 10): Promise<VideoItem[]> {
  const { data } = await http.get<VideoItem[]>('/videos', { params: { page, perPage } })
  return data
}
```

页面、composable、组件一行都不用动。挂载点赞/评论时，`SideActions.vue` 加 props + emits 即可。

## 9. 给 AI 助手的硬性约定

- **不要**把视频源判断逻辑写回页面里，一律走 provider。
- **不要**往 `VideosView.vue` 里加新逻辑或新样式，它有明确的上限。
- **不要**在 `composables` 里写模板/样式，在 `components` 里写数据请求。
- **不要**硬编码密钥；需要配置就加 `VITE_` 变量并同步更新 `.env.example` 与 `env.d.ts`。
- 改完必须跑 `npm run build`（含 `vue-tsc`），类型错误一律不允许提交。
- 提交前留意 `.env.local`、`dist/` 不应进入版本库。
- 命名：文件用 PascalCase（组件）或 camelCase（ts），引用使用 `@/` 别名。
