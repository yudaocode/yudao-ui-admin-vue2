/**
 * 网络状态监听，对齐 Vue3 src/hooks/web/useNetwork.ts
 *
 * 接入方式（任选其一）：
 *   1. mixin：import { networkMixin } from '@/utils/network'，组件内 this.online 实时反映联网状态
 *   2. 事件函数：const off = onNetworkChange((online) => {...})，返回注销函数
 */
export function isOnline() {
  return typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean'
    ? true
    : navigator.onLine
}

export function onNetworkChange(callback) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  const onOnline = () => callback(true)
  const onOffline = () => callback(false)
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

export const networkMixin = {
  data() {
    return {
      online: isOnline()
    }
  },
  mounted() {
    this.__offNetworkChange = onNetworkChange((online) => {
      this.online = online
    })
  },
  beforeDestroy() {
    if (this.__offNetworkChange) {
      this.__offNetworkChange()
      this.__offNetworkChange = null
    }
  }
}

export default networkMixin
