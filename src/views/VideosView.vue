<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useVideoList } from '@/composables/useVideoList'
import { useVideoPlayer } from '@/composables/useVideoPlayer'
import { useVideoProgress } from '@/composables/useVideoProgress'
import { useVolume } from '@/composables/useVolume'
import { useFullscreen } from '@/composables/useFullscreen'
import { useWheelNav } from '@/composables/useWheelNav'
import { useKeyboardNav } from '@/composables/useKeyboardNav'
import SideActions from '@/components/video/SideActions.vue'
import SwipeNav from '@/components/video/SwipeNav.vue'
import VideoControls from '@/components/video/VideoControls.vue'
import VideoMeta from '@/components/video/VideoMeta.vue'

/**
 * 视频播放页 —— 只做"编排"：
 * 把数据(useVideoList)、播放器(useVideoPlayer)、进度(useVideoProgress)、
 * 音量(useVolume)、全屏(useFullscreen) 和几个展示组件拼在一起。
 *
 * 具体逻辑在 composables 里，具体 UI 在 components/video 里，
 * 这个文件不应该再增长。要加功能请改对应的 composable / 组件。
 */

/** 真正的 <video> 元素，所有播放相关的 composable 都基于它 */
const videoPlayer = ref<HTMLVideoElement | null>(null)
/** 全屏的作用对象：视频容器，而不是整个页面 */
const videoContainer = ref<HTMLElement | null>(null)
/** 滚轮监听的范围：整个播放区（卡片 + 右侧切换列），不含左侧导航 */
const mainView = ref<HTMLElement | null>(null)

const {
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
} = useVideoList()

const {
  isPlaying,
  videoReady,
  play,
  pause,
  togglePlay,
  onLoadedData,
  onPlay,
  onPause,
  onError,
  resetPlaybackState,
} = useVideoPlayer(videoPlayer, (message) => {
  error.value = message
})

const { percent, onLoadedMetadata, onTimeUpdate, seek, seekForward, seekBackward, resetProgress } =
  useVideoProgress(videoPlayer)

const { volumeLevel, isMuted, applyInitialMute, toggleMute, setVolume, onVolumeChange } =
  useVolume(videoPlayer)

const { toggleFullscreen } = useFullscreen(videoContainer)

// 滚轮上下滑：和右侧胶囊按钮走同一套动作，不另写逻辑
useWheelNav(mainView, { onPrev: goPrev, onNext: goNext })

// w 上一条 / s 下一条 / a 后退一小段 / d 前进一小段
useKeyboardNav({
  onPrev: goPrev,
  onNext: goNext,
  onSeekBackward: seekBackward,
  onSeekForward: seekForward,
})

/** 换了视频源：把"就绪"和进度都清掉，让 loading 提示重新出现 */
watch(currentUrl, () => {
  resetPlaybackState()
  resetProgress()
})

onMounted(async () => {
  await load(1, 10)
  // 等 <video> 渲染出来再静音 + 播放，绕开浏览器自动播放限制
  nextTick(() => {
    applyInitialMute()
    play()
  })
})

onBeforeUnmount(() => {
  // 路由切走后别让视频音频还在响。
  // 必须用 beforeUnmount：到 unmounted 时模板 ref 已经被置空，拿不到 <video> 了。
  pause()
})

function goNext() {
  next()
  isPlaying.value = true
}

function goPrev() {
  prev()
  isPlaying.value = true
}
</script>

<template>
  <div ref="mainView" class="main">
    <div class="videos-view">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">加载视频中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <!-- 主内容 -->
      <div v-else class="content-wrapper">
        <div ref="videoContainer" class="left video-container">
          <div class="video-player-wrapper">
            <!-- 视频加载中提示 -->
            <div v-if="currentUrl && !videoReady" class="loading" style="color: red">
              视频加载中...
            </div>

            <video
              v-if="currentUrl"
              ref="videoPlayer"
              :src="currentUrl"
              :poster="currentPoster"
              class="video-player"
              autoplay
              playsinline
              @ended="goNext"
              @loadeddata="onLoadedData"
              @loadedmetadata="onLoadedMetadata"
              @timeupdate="onTimeUpdate"
              @volumechange="onVolumeChange"
              @play="onPlay"
              @pause="onPause"
              @error="onError"
              @click="togglePlay"
            >
              <p>您的浏览器不支持视频播放</p>
            </video>
            <div v-else class="error">暂无视频播放</div>

            <SideActions />

            <VideoControls
              :is-playing="isPlaying"
              :volume-level="volumeLevel"
              :is-muted="isMuted"
              :percent="percent"
              @toggle-play="togglePlay"
              @toggle-mute="toggleMute"
              @toggle-fullscreen="toggleFullscreen"
              @volume-change="setVolume"
              @seek="seek"
            />

            <VideoMeta
              v-if="currentVideo"
              :video="currentVideo"
              :index="currentIndex"
              :total="videoList.length"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧导航列：卡片外侧的留白区，上/下切换按钮垂直居中放在这里 -->
    <div class="nav-rail">
      <SwipeNav @prev="goPrev" @next="goNext" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.main {
  display: flex;
  height: 100vh;
  width: 100vw;
  max-width: 100%;

  .videos-view {
    position: relative;
    /* flex:1 让卡片吃掉"容器宽度 - 右侧导航列"的剩余空间，
       不再写死 85vw，避免和导航列加起来超过父容器导致横向溢出 */
    flex: 1 1 auto;
    min-width: 0;
    width: 85vw;
    height: 92vh;
    max-width: 100%;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 2%;

    /* 加载和错误状态 */
    .loading,
    .error {
      color: white;
      font-size: 20px;
      text-align: center;
      z-index: 10;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .error {
      color: red;
    }

    /* 左右布局容器 */
    .content-wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      max-width: 1400px;
      padding: 20px;
      box-sizing: border-box;
      gap: 20px;
    }

    /* 视频区域 */
    .left.video-container {
      flex: 1;
      width: 85vw;
      height: 88vh;
      max-height: 100%;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #000;
      border-radius: 8px;
      position: relative;
      min-height: 0;
      overflow: hidden;
    }

    /* 视频播放器包装 */
    .video-player-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
    }

    /* 视频播放器 */
    .video-player {
      width: 100%;
      height: 100%;
      background-color: #000;
      display: block;
    }
  }

  /**
   * 右侧导航列 —— 视频卡片外侧的留白区。
   * 真实抖音的版式：卡片左边贴内容区、右边留一条窄列，上下切换按钮在这条列里垂直居中。
   * 用真实布局列（而不是给按钮加负偏移）的好处：不依赖 overflow，窗口再窄也不会溢出屏幕。
   */
  .nav-rail {
    flex: 0 0 5vw;
    min-width: 40px;
    /* 高度跟视频卡片一致（92vh），这样按钮是相对"卡片"垂直居中，
       而不是相对整页垂直居中，两者会差几个像素 */
    height: 92vh;
    align-self: flex-start;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
