/**
 * 实时时钟，对齐 Vue3 src/hooks/web/useNow.ts（dayjs 实现，仓库已内置 dayjs）
 *
 * 接入方式（任选其一）：
 *   1. mixin：import { nowMixin } from '@/utils/now'
 *      组件内通过 this.nowState.year / month / week / day / hour / minute / second / meridiem 使用
 *   2. 工厂函数：const nowCtl = createNow()（供非组件场景手动 start/stop）
 */
import dayjs from 'dayjs'

function buildState() {
  return {
    year: 0,
    month: 0,
    week: '',
    day: 0,
    hour: '',
    minute: '',
    second: 0,
    meridiem: ''
  }
}

export function updateNowState(state) {
  const now = dayjs()

  const h = now.format('HH')
  const m = now.format('mm')
  const s = now.get('s')

  state.year = now.get('y')
  state.month = now.get('M') + 1
  state.week = '星期' + ['日', '一', '二', '三', '四', '五', '六'][now.day()]
  state.day = now.get('date')
  state.hour = h
  state.minute = m
  state.second = s
  state.meridiem = now.format('A')
  return state
}

export function createNow(immediate = true) {
  let timer = null
  const state = buildState()

  const update = () => updateNowState(state)

  function start() {
    update()
    clearInterval(timer)
    timer = setInterval(update, 1000)
  }

  function stop() {
    clearInterval(timer)
    timer = null
  }

  if (immediate) {
    start()
  }

  return {
    state,
    start,
    stop
  }
}

export const nowMixin = {
  data() {
    return {
      nowState: buildState()
    }
  },
  methods: {
    startNow() {
      this.stopNow()
      updateNowState(this.nowState)
      this.__nowTimer = setInterval(() => updateNowState(this.nowState), 1000)
    },
    stopNow() {
      clearInterval(this.__nowTimer)
      this.__nowTimer = null
    }
  },
  mounted() {
    this.startNow()
  },
  beforeDestroy() {
    this.stopNow()
  }
}

export default nowMixin
