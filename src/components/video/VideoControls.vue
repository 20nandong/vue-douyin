<script setup lang="ts">
import { ref } from 'vue'

/**
 * 视频控件层：音量面板、左下播放/暂停、右下全屏、底部进度条。
 *
 * 这是一个"哑组件"：不自己碰 <video>，所有状态靠 props 进来，
 * 所有操作靠 emits 抛给父组件（VideosView）执行。
 *
 * 注意：根节点是 4 个绝对定位的独立元素（多根组件），
 * 这样不会在 DOM 里多套一层 div 影响原有布局。
 */
defineProps<{
  isPlaying: boolean
  volumeLevel: number
  isMuted: boolean
  /** 0 ~ 100 */
  percent: number
}>()

const emit = defineEmits<{
  'toggle-play': []
  'toggle-mute': []
  'toggle-fullscreen': []
  'volume-change': [value: number]
  seek: [ratio: number]
}>()

const progressBarRef = ref<HTMLElement | null>(null)

function onSliderInput(e: Event) {
  emit('volume-change', Number((e.target as HTMLInputElement).value))
}

function onProgressClick(e: MouseEvent) {
  const bar = progressBarRef.value
  if (!bar) return
  const rect = bar.getBoundingClientRect()
  emit('seek', (e.clientX - rect.left) / rect.width)
}
</script>

<template>
  <!-- 音量控制区域 -->
  <div class="volume-control">
    <div class="slider-area">
      <input
        type="range"
        min="0"
        max="100"
        :value="volumeLevel"
        class="volume-slider-vertical"
        @input="onSliderInput"
      />
      <div class="volume-percent">{{ volumeLevel }}%</div>
    </div>

    <div class="volume-icon" @click="emit('toggle-mute')">
      <button class="icon-btn" type="button" aria-label="静音切换">
        <!-- 有声图标：非静音且音量 > 0 -->
        <svg
          v-if="!isMuted && volumeLevel > 0"
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M509.226667 167.722667l-222.442667 184.341333c-16.704 13.866667-43.178667 23.402667-64.896 23.402667H170.730667A42.666667 42.666667 0 0 0 128 418.090667v187.434666c0 23.466667 19.178667 42.624 42.730667 42.624H221.866667c21.802667 0 48.170667 9.536 64.896 23.402667l222.421333 184.32V167.744zM259.541333 704.426667c-9.045333-7.509333-25.770667-13.589333-37.674666-13.589334H170.730667A85.418667 85.418667 0 0 1 85.333333 605.525333v-187.434666A85.333333 85.333333 0 0 1 170.730667 332.8H221.866667c11.776 0 28.629333-6.08 37.674666-13.589333L519.125333 104.106667c18.090667-14.997333 32.746667-8.170667 32.746667 15.402666v784.64c0 23.488-14.677333 30.378667-32.746667 15.402667L259.562667 704.405333z m436.117334-4.821334a21.333333 21.333333 0 1 1-26.026667-33.834666A196.608 196.608 0 0 0 746.666667 509.504c0-57.408-29.269333-112.32-77.482667-151.637333a21.333333 21.333333 0 1 1 26.965333-33.066667C753.792 371.797333 789.333333 438.485333 789.333333 509.504c0 75.370667-35.050667 144.981333-93.653333 190.08z m64 170.666667a21.333333 21.333333 0 1 1-26.026667-33.834667A414.506667 414.506667 0 0 0 896 507.029333c0-121.642667-61.696-237.354667-162.816-319.829333a21.333333 21.333333 0 1 1 26.965333-33.066667C870.698667 244.309333 938.666667 371.776 938.666667 507.029333a457.173333 457.173333 0 0 1-178.986667 363.221334z"
            fill="#ffffff"
          />
        </svg>

        <!-- 静音图标 -->
        <svg v-else class="icon" viewBox="0 0 1025 1024" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M652.569422 94.472586a25.86878 25.86878 0 0 1 17.409787-6.491785 26.262221 26.262221 0 0 1 26.163861 26.262221V529.22546l78.688303 78.688303V114.243022a104.950524 104.950524 0 0 0-173.99951-78.688303L388.176725 221.259114l55.770334 55.770335zM1012.470048 956.798025l-944.259635-944.259634-1.967207-1.967208a39.344151 39.344151 0 1 0-53.704767 57.639182l189.73717 189.63881A157.376606 157.376606 0 0 0 92.800508 407.553671v219.146924a157.376606 157.376606 0 0 0 157.376606 148.13073H355.127637l245.900947 214.917427 6.196704 5.11474a104.950524 104.950524 0 0 0 167.802806-84.098124v-80.360429l181.9667 182.065061a39.344151 39.344151 0 0 0 55.671974-55.671975z m-316.326978-46.032657v4.426217a26.557302 26.557302 0 0 1-6.098343 12.88521 26.163861 26.163861 0 0 1-36.983503 2.459009l-245.900946-214.917427-6.393425-5.11474a78.688303 78.688303 0 0 0-45.442495-14.360615H242.701725a78.688303 78.688303 0 0 1-71.212914-78.688303v-217.376436a78.688303 78.688303 0 0 1 78.688303-71.212915h23.114689l422.949627 422.949628z"
            fill="#ffffff"
          />
        </svg>
      </button>
    </div>
  </div>

  <!-- 左下角：播放 / 暂停 -->
  <div class="left-play-control" @click="emit('toggle-play')">
    <!-- 暂停态显示播放键 -->
    <svg v-if="!isPlaying" class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M122.112664 953.98846l816.371172-407.954319c0.723477-0.342808 1.411139-0.689708 2.099824-1.051959l1.107217-0.550539 0-0.077771c11.644201-6.757914 19.488867-19.377326 19.488867-33.827433 0-14.452153-7.844665-27.070542-19.488867-33.828456l0-0.228197L120.241037 65.955154c-1.14508-0.649799-2.310625-1.24127-3.51301-1.77646l-2.481518-1.240247-0.230244 0.170892c-4.047176-1.431605-8.41874-2.196015-12.96222-2.196015-21.589714 0-39.096437 17.506722-39.096437 39.096437 0 0.192382 0 0.382717 0 0.593518l0 821.276902 0.01842 0c0.438998 21.210068 17.754363 38.255279 39.078017 38.255279C108.80559 960.13546 116.040365 957.887256 122.112664 953.98846z"
        fill="#ffffff"
      />
    </svg>
    <!-- 播放态显示暂停键 -->
    <svg v-else class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M128 106.858667C128 94.976 137.621333 85.333333 149.12 85.333333h85.76c11.648 0 21.12 9.6 21.12 21.525334V917.12c0 11.882667-9.621333 21.525333-21.12 21.525333H149.12A21.290667 21.290667 0 0 1 128 917.141333V106.88z m640 0c0-11.882667 9.621333-21.525333 21.12-21.525334h85.76c11.648 0 21.12 9.6 21.12 21.525334V917.12c0 11.882667-9.621333 21.525333-21.12 21.525333h-85.76a21.290667 21.290667 0 0 1-21.12-21.525333V106.88z"
        fill="#ffffff"
      />
    </svg>
  </div>

  <!-- 右下角：全屏 -->
  <div class="fullscreen-control" @click="emit('toggle-fullscreen')">
    <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M95.500388 368.593511c0 11.905658-9.637914 21.543572-21.543573 21.543572-11.877311 0-21.515225-9.637914-21.515225-21.543572V188.704684c0-37.502824 15.307275-71.575684 39.997343-96.265751s58.762928-39.997342 96.265751-39.997343h179.888827c11.905658 0 21.543572 9.637914 21.543572 21.515225 0 11.905658-9.637914 21.543572-21.543572 21.543573H188.704684c-25.625512 0-48.926586 10.488318-65.821282 27.383014s-27.383014 40.19577-27.383014 65.821282v179.888827z m559.906101-273.093123c-11.877311 0-21.515225-9.637914-21.515226-21.543573 0-11.877311 9.637914-21.515225 21.515226-21.515225h179.917174c37.502824 0 71.547337 15.307275 96.237404 39.997343s40.025689 58.762928 40.02569 96.265751v179.888827c0 11.905658-9.637914 21.543572-21.543572 21.543572-11.877311 0-21.515225-9.637914-21.515226-21.543572V188.704684c0-25.625512-10.488318-48.926586-27.411361-65.821282-16.894696-16.894696-40.19577-27.383014-65.792935-27.383014h-179.917174z m273.12147 559.906101c0-11.877311 9.637914-21.515225 21.515226-21.515226 11.905658 0 21.543572 9.637914 21.543572 21.515226v179.917174c0 37.474477-15.335622 71.547337-40.02569 96.237404s-58.734581 39.997342-96.237404 39.997343h-179.917174c-11.877311 0-21.515225-9.637914-21.515226-21.515225s9.637914-21.543572 21.515226-21.543573h179.917174c25.597165 0 48.898239-10.488318 65.792935-27.383014 16.923043-16.894696 27.411361-40.19577 27.411361-65.792935v-179.917174z m-559.934448 273.093123c11.905658 0 21.543572 9.666261 21.543572 21.543573s-9.637914 21.515225-21.543572 21.515225H188.704684c-37.502824 0-71.575684-15.307275-96.265751-39.997343s-39.997342-58.762928-39.997343-96.237404v-179.917174c0-11.877311 9.637914-21.515225 21.515225-21.515226 11.905658 0 21.543572 9.637914 21.543573 21.515226v179.917174c0 25.597165 10.488318 48.898239 27.383014 65.792935s40.19577 27.383014 65.821282 27.383014h179.888827z"
        fill="#ffffff"
      />
    </svg>
  </div>

  <!-- 进度条 -->
  <div ref="progressBarRef" class="progress-bar" @click="onProgressClick">
    <div class="progress-track"></div>
    <div class="progress-fill" :style="{ width: percent + '%' }"></div>
    <div class="progress-dot" :style="{ left: percent + '%' }"></div>
  </div>
</template>

<style scoped lang="scss">
/* 左下角：播放 / 暂停 */
.left-play-control {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 15;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }

  .icon {
    width: 32px;
    height: 32px;
    fill: rgba(255, 255, 255, 0.9);
    transition: all 0.2s ease;
  }

  &:hover .icon {
    fill: #ffffff;
    transform: scale(1.1);
  }
}

/* 右下角：全屏 */
.fullscreen-control {
  position: absolute;
  bottom: 20px;
  right: 10px;
  z-index: 15;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }

  .icon {
    width: 24px;
    height: 24px;
    fill: #fff;
  }
}

/* 音量控制 */
.volume-control {
  position: absolute;
  bottom: 20px;
  right: 40px;
  z-index: 20;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  background: rgba(0, 0, 0, 0.5);
  padding: 15px 10px;
  border-radius: 30px;
  color: white;
  font-size: 14px;
  user-select: none;

  .volume-icon {
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  .icon-btn {
    background: none;
    border: none;
    padding: 0;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    width: 24px;
    height: 24px;
    fill: #fff;
    display: block;
  }

  .slider-area {
    position: relative;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .volume-percent {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.6);
    padding: 2px 6px;
    border-radius: 10px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    pointer-events: none;
  }

  .volume-slider-vertical {
    -webkit-appearance: none;
    appearance: none;

    width: 70px;
    height: 5px;

    transform: rotate(-90deg);
    transform-origin: center;

    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    margin: 0;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }
  }
}

/* 进度条 */
.progress-bar {
  position: absolute;
  bottom: 80px;
  left: 20px;
  right: 20px;
  height: 4px;
  z-index: 15;
  cursor: pointer;

  .progress-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #fff;
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  .progress-dot {
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: left 0.1s linear;
    opacity: 0;
  }

  &:hover .progress-dot {
    opacity: 1;
  }

  &:hover {
    height: 6px;

    .progress-track,
    .progress-fill {
      border-radius: 3px;
    }
  }
}
</style>
