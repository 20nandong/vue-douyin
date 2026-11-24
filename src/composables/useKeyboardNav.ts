import { onBeforeUnmount, onMounted } from 'vue'

interface KeyboardNavHandlers {
  onPrev: () => void
  onNext: () => void
  onSeekForward: () => void
  onSeekBackward: () => void
  onTogglePlay: () => void
}

/**
 * 按键 → 动作。想加新键，只改这一张表。
 *
 * 注意 key 一律小写：下面用 event.key.toLowerCase() 去查，
 * 所以 "W"（开了大写锁或者按住 Shift）也能认。
 * 方向键的 key 是 "ArrowUp" 这种写法，转小写就是 "arrowup"。
 * 空格的 key 就是一个空格字符 " "。
 */
const KEYMAP: Record<string, keyof KeyboardNavHandlers> = {
  w: 'onPrev',
  s: 'onNext',
  a: 'onSeekBackward',
  d: 'onSeekForward',
  // 方向键按"功能"对位，不是按字母顺序：
  // ↑ 上一条、↓ 下一条、← 后退、→ 前进 —— 和屏幕上的方向一致
  arrowup: 'onPrev',
  arrowdown: 'onNext',
  arrowleft: 'onSeekBackward',
  arrowright: 'onSeekForward',
  ' ': 'onTogglePlay',
}

/**
 * 在输入框里打字时不能触发快捷键——顶部搜索栏是个真实的 input，
 * 用户想搜 "w" 却被切了下一条视频，是很难理解的 bug。
 */
function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/**
 * 键盘快捷键：
 *   w / ↑  上一条        s / ↓  下一条
 *   a / ←  后退一小段    d / →  前进一小段
 *   空格   暂停 / 播放
 *
 * 只负责按键识别和分发，具体动作由调用方传进来，
 * 所以它既不知道视频在哪，也不知道怎么播放。
 */
export function useKeyboardNav(handlers: KeyboardNavHandlers) {
  function onKeydown(event: KeyboardEvent) {
    // 带修饰键的按键留给浏览器（Ctrl+W 是关标签页，不能抢）
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (isTypingTarget(event.target)) return

    const action = KEYMAP[event.key.toLowerCase()]
    if (!action) return

    // 按住不放会以每秒几十次的频率重复触发：
    // 空格会疯狂闪暂停，方向键会一路把视频翻到底。所以长按只算一次。
    if (event.repeat) {
      event.preventDefault()
      return
    }

    // 空格和方向键默认会滚动页面，必须拦掉
    event.preventDefault()
    handlers[action]()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
