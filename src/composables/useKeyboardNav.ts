import { onBeforeUnmount, onMounted } from 'vue'

interface KeyboardNavHandlers {
  onPrev: () => void
  onNext: () => void
  onSeekForward: () => void
  onSeekBackward: () => void
}

/** 按键 → 动作。想加方向键、空格，只改这一张表 */
const KEYMAP: Record<string, keyof KeyboardNavHandlers> = {
  w: 'onPrev',
  s: 'onNext',
  a: 'onSeekBackward',
  d: 'onSeekForward',
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
 * w 上一条 / s 下一条 / a 后退一小段 / d 前进一小段。
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

    event.preventDefault()
    handlers[action]()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
