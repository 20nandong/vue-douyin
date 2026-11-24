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
.right.button-panel {
  width: 4vw;
  height: 88vh;
  max-width: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;

  .button-container {
    width: 50%;
    height: 10%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 28px;
    padding: 15px 0;
    box-sizing: border-box;
  }

  .nav-button {
    width: 15px;
    height: 15px;
    background-color: rgba(255, 255, 255, 0);
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .icon {
      width: 24px;
      height: 24px;
      fill: #fff;
    }
  }

  /* 下一条按钮图标旋转 180 度 */
  .next-btn .icon {
    transform: rotate(180deg);
  }
}
</style>
