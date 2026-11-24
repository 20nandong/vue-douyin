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
 * 定位说明（别改回 .videos-view 的 flex 子元素，也别加 absolute）：
 * 真实抖音里这条胶囊在**视频卡片外侧**的窄列中垂直居中，不在视频画面里。
 *
 * 所以它现在由 VideosView 的 .nav-rail 这一列来定位（父级 align-items:center），
 * 组件本身只管自己的样式，不写死任何坐标。
 * 早期写法是给按钮 absolute + 负 right 硬顶到卡片外，窗口一窄就溢出屏幕，已废弃。
 */
.right.button-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /**
   * 胶囊尺寸随屏幕缩放：clamp(最小值, 中间值, 最大值)。
   *
   * 为什么不用百分比：父级 .nav-rail 只有 5vw 宽（最小 40px），
   * 在里面写 % 是"相对胶囊自己"，绕一圈还是定值。
   * vw / vh 才是相对屏幕的，外面再套 clamp 限住上下限，窗口再大再小都不会变形。
   */
  .button-container {
    width: clamp(36px, 3vw, 46px);
    /* 高度跟着视口高度走：570 高的窗口给 84，1080 高给到 110 封顶 */
    height: clamp(84px, 11vh, 110px);
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    padding: clamp(6px, 0.8vh, 10px) 0;
    box-sizing: border-box;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.18);
    }
  }

  .nav-button {
    /* 整块都能点：宽度吃满胶囊、上下各占一半，
       热区从原来的 24×20 变成约 46×44，不用瞄那么准了 */
    flex: 1;
    width: 100%;
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    border-radius: 999px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.12);
    }

    .icon {
      width: clamp(15px, 1.4vw, 20px);
      height: clamp(15px, 1.4vw, 20px);
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
