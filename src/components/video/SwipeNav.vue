<script setup lang="ts">
/**
 * 右侧竖排的上一条 / 下一条按钮。
 * 纯展示，点击后把事件抛给父组件处理切换逻辑。
 */
const emit = defineEmits<{
  prev: []
  next: []
}>()
</script>

<template>
  <div class="right button-panel">
    <div class="button-container">
      <button class="nav-button prev-btn" type="button" aria-label="上一条" @click="emit('prev')">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M904 692c0 8.189-3.124 16.379-9.372 22.628-12.497 12.496-32.759 12.496-45.256 0L512 377.255 174.628 714.628c-12.497 12.496-32.758 12.496-45.255 0-12.497-12.498-12.497-32.758 0-45.256l360-360c12.497-12.496 32.758-12.496 45.255 0l360 360C900.876 675.621 904 683.811 904 692z"
            fill="#bfbfbf"
          />
        </svg>
      </button>

      <button class="nav-button next-btn" type="button" aria-label="下一条" @click="emit('next')">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M904 692c0 8.189-3.124 16.379-9.372 22.628-12.497 12.496-32.759 12.496-45.256 0L512 377.255 174.628 714.628c-12.497 12.496-32.758 12.496-45.255 0-12.497-12.498-12.497-32.758 0-45.256l360-360c12.497-12.496 32.758-12.496 45.255 0l360 360C900.876 675.621 904 683.811 904 692z"
            fill="#bfbfbf"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
/**
 * 定位说明（别改回 flex 子元素）：
 * 这里用 absolute 挂在视频区最右侧并垂直居中，是抖音的真实版式。
 * 如果让它留在 .videos-view 的 flex 流里，它就会占掉 4vw 宽度，
 * 把视频容器挤窄、自己偏到画面右侧的黑边上，看起来就像"飘在外面"。
 * 脱离文档流后，视频容器能占满整个宽度，箭头正好压在视频右边缘。
 */
.right.button-panel {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  z-index: 15;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .button-container {
    width: 24px;
    height: 68px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 28px;
    padding: 10px 0;
    box-sizing: border-box;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.18);
    }
  }

  .nav-button {
    width: 24px;
    height: 20px;
    background-color: rgba(255, 255, 255, 0);
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;

    .icon {
      width: 16px;
      height: 16px;
      fill: #fff;
      opacity: 0.85;
      transition: opacity 0.2s;
    }

    &:hover .icon {
      opacity: 1;
    }
  }

  /* 下一条按钮图标旋转 180 度 */
  .next-btn .icon {
    transform: rotate(180deg);
  }
}
</style>
