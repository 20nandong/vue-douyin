<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useVideoList } from '@/composables/useVideoList'
import { useVideoPlayer } from '@/composables/useVideoPlayer'
import { useVideoProgress } from '@/composables/useVideoProgress'
import { useVolume } from '@/composables/useVolume'
import { useFullscreen } from '@/composables/useFullscreen'
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

const { percent, onLoadedMetadata, onTimeUpdate, seek, resetProgress } =
  useVideoProgress(videoPlayer)

const { volumeLevel, isMuted, applyInitialMute, toggleMute, setVolume, onVolumeChange } =
  useVolume(videoPlayer)

const { toggleFullscreen } = useFullscreen(videoContainer)

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

onUnmounted(() => {
  // 路由切走后别让视频音频还在响
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
  <div class="main">
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
}
</style>
