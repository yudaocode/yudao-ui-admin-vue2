import Vue, { isRef } from 'vue'

const stores = new Map()

function exposeSetupStore(result) {
  return new Proxy(result, {
    get(target, key) {
      const value = target[key]
      return isRef(value) ? value.value : value
    },
    set(target, key, value) {
      const current = target[key]
      if (isRef(current)) {
        current.value = value
      } else {
        target[key] = value
      }
      return true
    }
  })
}

function createOptionsStore(options) {
  const state = Vue.observable(options.state ? options.state() : {})
  const store = state
  Object.entries(options.getters || {}).forEach(([name, getter]) => {
    Object.defineProperty(store, name, {
      enumerable: true,
      configurable: false,
      get: () => getter.call(store, store)
    })
  })
  Object.entries(options.actions || {}).forEach(([name, action]) => {
    store[name] = action.bind(store)
  })
  return store
}

/** Vue2 单例 Store 工厂：保持 Vue3 store 的公开字段、getter 和 action 契约。 */
export function defineStore(id, options) {
  return function useStore() {
    if (!stores.has(id)) {
      stores.set(id, typeof options === 'function' ? exposeSetupStore(options()) : createOptionsStore(options))
    }
    return stores.get(id)
  }
}
