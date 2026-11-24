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

**装了但当前没用到的**：`pinia`（未 `createPinia`）。
`lodash` / `swiper` / `xgplayer` 已于 2026-11-24 的重构中从依赖中移除；
`src/components/icons/HomeIcon.vue`（从未被引用的图标合集）同轮删除。

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
│   ├── useVideoProgress.ts      # duration / currentTime / percent / seek(ratio) / 快进快退(按秒，3~7s)
│   ├── useVolume.ts             # volumeLevel / isMuted / toggleMute / setVolume
│   ├── useFullscreen.ts         # 对指定容器做全屏，监听 fullscreenchange
│   ├── useWheelNav.ts           # 滚轮/触控板上下滑切换（带冷却，见 6.7）
│   └── useKeyboardNav.ts        # 键盘 w/s/a/d + ↑↓←→ + 空格（KEYMAP 表驱动，见 6.7）
│
├── components/video/            # ★ 播放页的 UI 切片
│   ├── VideoControls.vue        # 音量面板 + 左下播放键 + 右下全屏 + 底部进度条（多根组件）
│   ├── SideActions.vue          # 右侧竖排：点赞/评论/收藏/分享（目前纯装饰）
│   ├── VideoMeta.vue            # 左下角作者名、作者主页、第 n / 总数
│   └── SwipeNav.vue             # 上一条/下一条胶囊（由 VideosView 的 .nav-rail 列定位，见 6.6）
│
├── views/
│   ├── HomeView.vue             # 外壳：左侧导航 + 顶部搜索栏 + <router-view>
│   ├── VideosView.vue           # ★ 播放页，只做"编排"，约 3xx 行（含样式）
│   └── BlockView.vue            # "功能尚未开发"占位页
│
├── shims-vue.d.ts               # 让 TS 认识 *.vue 导入；vue-tsc --build 缺了它必报 TS7016
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

### 6.6 上/下切换按钮为什么放在 `.nav-rail` 列里

真实抖音的版式：**视频卡片左边贴内容区，右边留一条窄列，上/下切换胶囊在这条列里垂直居中，不在视频画面内。**

所以 `VideosView.vue` 的 `.main` 是两列：`.videos-view`（卡片，`flex:1 1 auto`）+ `.nav-rail`（`flex: 0 0 5vw; height:92vh; align-items:center`），`SwipeNav` 放在 `.nav-rail` 里，自身不写任何坐标。

这个位置前后踩过两次坑，**都别再回去**：

1. 让 `SwipeNav` 当 `.videos-view` 的 flex 子元素（2026-11 之前的写法）：它会占掉固定宽度，把视频容器挤窄，视频因此等比留黑边，按钮落在黑边上，看着像"飘在画面外"。
2. 给 `SwipeNav` 加 `position:absolute` + 负 `right` 硬顶到卡片外：位置是对了，但依赖负偏移，窗口一窄就溢出屏幕，还得去掉父级 `overflow:hidden`。

用真实布局列的好处：垂直居中天然跟卡片对齐，不依赖 overflow，任意宽度都不溢出。

实测（`.nav-rail` 方案，`scrollOverflow` 均为 0；胶囊宽 30~38px，是原始写死 24px 的 1.25~1.58 倍）：

| 视口 | 卡片右边缘 | 胶囊 | 距卡片 | 胶囊尺寸 |
|---|---|---|---|---|
| 900 | 845 | 853–883 | 8px | 30×84 |
| 1080 | 1016 | 1026–1060 | 10px | 35×84 |
| 1440 | 1358 | 1375–1413 | 17px | 38×84 |
| 1920 | 1814 | 1843–1881 | 29px | 38×84 |

四种宽度下胶囊的垂直中心与卡片中心完全一致。

**宽度别再放大。** 曾用过 `clamp(36px, 3vw, 46px)`（热区约 2.8 倍），实测观感臃肿，已收回到
`clamp(30px, 3.2vw, 38px)`。高度两版都用 `clamp(84px, 11vh, 110px)`，没有争议。
按钮热区靠 `flex:1; width:100%` 吃满半块胶囊（约 35×36），不靠放大整体尺寸。

### 6.7 滚轮与键盘：多种输入源共用同一套动作

上一条/下一条现有三个入口：右侧胶囊按钮、鼠标滚轮、键盘 `w`/`s`/`↑`/`↓`。三者**不各自实现逻辑**，
全部调用 `VideosView` 里的 `goNext()` / `goPrev()`。加第四个入口（比如手势）只要再写一个 composable。

**滚轮（`useWheelNav`）的两个参数不是随便给的**：

- `threshold: 8` —— 过滤触控板的高频抖动；
- `cooldown: 480ms` —— 一次滚轮手势浏览器会连发多个 wheel 事件，不挡的话一口气跳过好几条。

监听范围是 `.main`（卡片 + 右侧切换列），**不是 window**：鼠标停在左侧导航或顶部搜索栏滚动时不应切视频。

**键盘（`useKeyboardNav`）键位**：

| 键 | 动作 |
|---|---|
| `w` / `↑` | 上一条 |
| `s` / `↓` | 下一条 |
| `a` / `←` | 后退一小段 |
| `d` / `→` | 前进一小段 |
| `空格` | 暂停 / 播放 |

- 按键表是文件顶部的 `KEYMAP`（键名一律小写，用 `event.key.toLowerCase()` 查），加键只改那一张表；
- **必须排除输入框焦点**（`isTypingTarget`）。顶部搜索栏是真实 input，用户在搜索框里打 "w"
  却被切了下一条视频，会显得像 bug；
- 带 Ctrl/Meta/Alt 的组合键一律放行，否则会抢掉 Ctrl+W 关闭标签页；
- **`event.repeat` 直接吞掉**：按住空格会以每秒几十次闪暂停，按住 `↓` 会一路翻到底。
  长按只算一次是刻意的，别为了"按住连续快进"去掉它。

**快进快退的步长**（`useVideoProgress.ts` 顶部三个常量）：

```ts
SEEK_STEP_RATIO = 0.1        // 基准：视频总时长的 10%
SEEK_STEP_MIN_SECONDS = 3    // 保底 3 秒
SEEK_STEP_MAX_SECONDS = 7    // 封顶 7 秒
```

即 `clamp(duration * 0.1, 3, 7)`，由纯函数 `getSeekStepSeconds(duration)` 计算。
**为什么要上下限**：本项目视频 20~40 秒，10% 只有 2~4 秒；但同一个播放器以后可能放 10 分钟的长视频，
10% 就是 60 秒，按一下跳走一分钟太粗 —— 封顶 7 秒。反过来极短的片子 10% 不到 1 秒，按了像没反应 —— 保底 3 秒。
`seekBySeconds` 把结果夹在 `[0, duration-0.05]`，倒退回开头不会变负数，快进到结尾不会溢出
（`currentTime` 超过 duration 会让 video 进入 error），留 0.05s 余量避免刚好触发 `ended`。

实测（1080×570，真实时长 29.07s，视频在播所以含约 0.25s 播放漂移）：

| 场景 | 一次 `→`/`d` 的位移 |
|---|---|
| 真实 29.07s（10% = 2.9 → 保底 3） | +3.29s |
| 伪造 20s 时长（10% = 2 → 保底 3） | +3.31s |
| 伪造 60s 时长（10% = 6） | +6.27s |
| 伪造 300s 时长（10% = 30 → 封顶 7） | +7.25s |

键盘整体行为实测：空格 → `paused:true`，再按 → `paused:false`；`↓`/`↑` 切换索引正常；
搜索框内输入 "ww" 索引不变（输入框内容为 `ww`），失焦后 `↓` 立即恢复生效。

## 7. 已知问题（尚未修，按优先级）

1. 单个视频加载失败会触发 `error`，而 `v-else-if="error"` 会把整个播放区替换成一行红字，体验差。应改为只在该视频上提示并自动跳下一条。
2. 切换视频只改 `:src`，**没有预加载下一条**，每次切换都要等。
3. `object-fit` 目前没生效（写在 `<video>` 属性上无效，CSS 里相关行被注释），视频是等比留黑边而非铺满。
4. 侧栏高亮 `curNav` 是 `HomeView` 内的 ref，`onMounted` 里硬写 `"推荐"`（代码里已留注释说明）。刷新或直接访问 `#/wode` 时高亮错误。应从 `route.name` 派生。
5. Element Plus 是**全量注册**（`app.use(ElementPlus)`），`index-*.js` 约 1MB，CSS 约 350KB。只为一个输入框付了这个代价，应改按需引入。
6. 没有移动端适配、没有触摸手势（滚轮只对桌面有效）、没有错误边界。键盘已覆盖 `w/s/a/d` + `↑↓←→` + 空格。
7. 视频只有 8 条，靠 `% length` 无限循环，没有分页 / 无限流。
8. 滚轮切换是"一格一条"，没有抖音那种跟手的手势动画（上一条滑出、下一条滑入）。

> `npm run lint`（oxlint + eslint）与 `vue-tsc` 已于 2026-11-24 全部清零，
> 提交前必须保持全绿。`src/assets/iconfont/**` 是 iconfont.cn 生成的压缩产物，已在
> `.oxlintrc.json` 的 `ignorePatterns` 里排除，不要去改它。

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
- **不要**在 `VideosView.vue` 里直接 `addEventListener`。新增交互输入（手势、快捷键）写成 composable，
  动作复用 `goNext` / `goPrev`，不要另写一份切换逻辑（见 6.7）。
- **不要**给键盘监听去掉 `isTypingTarget` 判断，搜索框会误触发。
- **不要**把快进步长改回纯比例。现在是 `clamp(duration*0.1, 3s, 7s)`，上下限是为将来的长视频留的（见 6.7）。
  要调手感就改那三个常量，别改公式结构。
- **不要**放大 `SwipeNav` 胶囊宽度。它已经从 46px 收回到 38px 上限（用户反馈臃肿），
  想增大点击范围就调整按钮的 `flex` 占比，别整体放大。
- **不要**给 `SwipeNav` 加 `position:absolute` 或负偏移，也不要把它塞回 `.videos-view` 内部；它由 `.nav-rail` 列定位（见 6.6）。
- **不要**往 `VideosView.vue` 里加新逻辑或新样式，它有明确的上限。
- **不要**在 `composables` 里写模板/样式，在 `components` 里写数据请求。
- **不要**硬编码密钥；需要配置就加 `VITE_` 变量并同步更新 `.env.example` 与 `env.d.ts`。
- 改完必须跑 `npm run build`（含 `vue-tsc`），类型错误一律不允许提交。
- 提交前留意 `.env.local`、`dist/` 不应进入版本库。
- 命名：文件用 PascalCase（组件）或 camelCase（ts），引用使用 `@/` 别名。
