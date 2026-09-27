/**
 * 全局事件总线（Vue3 src/hooks/web/useEmitt.ts 的 Vue2 等价实现）
 *
 * Vue3 版本基于 mitt，通过 useEmitt({ name, callback }) 注册并在 onBeforeUnmount 中
 * 调用 emitter.off(name) 自动移除。Vue2 无 hook 形态，本模块导出等价的 on / off / emit：
 *
 *   // Vue3                              // Vue2
 *   const { emitter } = useEmitt()       import { on, off, emit } from '@/utils/eventBus'
 *   emitter.on(name, callback)           on(name, callback)
 *   emitter.emit(name, payload)          emit(name, payload)
 *   onBeforeUnmount(() => {              beforeDestroy() { off(name, callback) }
 *     emitter.off(name)                  // off(name) 会移除该事件的全部回调
 *   })
 */
const events = Object.create(null)

/** 注册事件监听，返回取消注册的函数 */
export function on(name, callback) {
  if (!events[name]) {
    events[name] = []
  }
  events[name].push(callback)
  return () => off(name, callback)
}

/** 触发事件 */
export function emit(name, payload) {
  const callbacks = events[name]
  if (!callbacks) {
    return
  }
  callbacks.slice().forEach((callback) => callback(payload))
}

/** 移除监听；不传 callback 时移除该事件的全部监听（等价 mitt 的 emitter.off(name)） */
export function off(name, callback) {
  if (!events[name]) {
    return
  }
  if (!callback) {
    delete events[name]
    return
  }
  const index = events[name].indexOf(callback)
  if (index !== -1) {
    events[name].splice(index, 1)
  }
  if (!events[name].length) {
    delete events[name]
  }
}

export default { on, off, emit }
