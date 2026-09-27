/**
 * 水印指令
 * 对齐 Vue3 src/hooks/web/useWatermark.ts，以 Vue2 自定义指令形态提供
 *
 * 用法：
 *   <div v-watermark="'yudao'"></div>
 *   <div v-watermark="{ text: 'yudao', color: 'rgba(255,0,0,0.15)', rotate: -20, width: 300, height: 240, fontSize: 15 }"></div>
 *   import { setWatermark, clearWatermark } from '@/directive/module/watermark'
 *   setWatermark(document.body, { text: 'yudao' }); clearWatermark(document.body)
 */
const WATERMARK_ID = 'watermark-dom'

// 每个宿主元素各自维护自己的 resize 回调
const stateMap = new WeakMap()

function normalize(options) {
  if (typeof options === 'string') {
    options = { text: options }
  }
  options = options || {}
  return {
    text: options.text || 'yudao',
    color: options.color || 'rgba(0, 0, 0, 0.15)',
    rotate: typeof options.rotate === 'number' ? options.rotate : -20,
    width: options.width || 300,
    height: options.height || 240,
    fontSize: options.fontSize || 15
  }
}

function createWatermark(el, options) {
  clearWatermark(el)

  const can = document.createElement('canvas')
  can.width = options.width
  can.height = options.height

  const cans = can.getContext('2d')
  if (cans) {
    cans.rotate((options.rotate * Math.PI) / 120)
    cans.font = options.fontSize + 'px Vedana'
    cans.fillStyle = options.color
    cans.textAlign = 'left'
    cans.textBaseline = 'middle'
    cans.fillText(options.text, can.width / 20, can.height)
  }

  const div = document.createElement('div')
  div.id = WATERMARK_ID
  div.className = 'watermark-dom'
  div.style.pointerEvents = 'none'
  div.style.top = '0px'
  div.style.left = '0px'
  div.style.position = 'absolute'
  div.style.zIndex = '100000000'
  div.style.width = document.documentElement.clientWidth + 'px'
  div.style.height = document.documentElement.clientHeight + 'px'
  div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat'

  // 绝对定位子节点需要宿主有定位上下文
  if (!/relative|absolute|fixed/.test(window.getComputedStyle(el).position)) {
    el.style.position = 'relative'
  }
  el.appendChild(div)
}

export function clearWatermark(el) {
  const state = stateMap.get(el)
  if (state) {
    window.removeEventListener('resize', state.onResize)
    stateMap.delete(el)
  }
  const dom = el.querySelector && el.querySelector('div#' + WATERMARK_ID)
  if (dom) {
    el.removeChild(dom)
  }
}

export function setWatermark(el, options) {
  options = normalize(options)
  clearWatermark(el)
  createWatermark(el, options)
  const state = {
    options,
    onResize: () => createWatermark(el, options)
  }
  window.addEventListener('resize', state.onResize)
  stateMap.set(el, state)
}

export default {
  inserted(el, binding) {
    setWatermark(el, binding.value)
  },
  componentUpdated(el, binding) {
    const state = stateMap.get(el)
    const next = JSON.stringify(normalize(binding.value))
    if (!state || JSON.stringify(state.options) !== next) {
      setWatermark(el, binding.value)
    }
  },
  unbind(el) {
    clearWatermark(el)
  }
}
