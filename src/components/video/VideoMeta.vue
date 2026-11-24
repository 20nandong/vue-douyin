<script setup lang="ts">
import type { VideoItem } from '@/types/video'

/**
 * 左下角视频信息（作者名 / 作者主页 / 当前第几条）。
 */
defineProps<{
  video: VideoItem
  index: number
  total: number
}>()
</script>

<template>
  <div class="video-info">
    <h3>{{ video.user?.name || '未知用户' }}</h3>
    <p>{{ video.user?.url || '' }}</p>
    <p>当前视频: {{ index + 1 }} / {{ total }}</p>
  </div>
</template>

<style scoped lang="scss">
.video-info {
  position: absolute;
  bottom: 10%;
  left: 20px;
  color: white;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 15px;
  border-radius: 5px;

  h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: #aaa;
  }
}
</style>
