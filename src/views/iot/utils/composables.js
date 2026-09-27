import { computed, ref } from 'vue'
import router from '@/router'
import store from '@/store'

export function useVModel(props, key, emit, options = {}) {
  return computed({
    get: () => props[key] === undefined ? options.defaultValue : props[key],
    set: value => emit(key === 'value' ? 'input' : `update:${key}`, value)
  })
}

export function useClipboard(options = {}) {
  const text = ref('')
  const copied = ref(false)
  // 对齐 vueuse useClipboard 契约：copy() 无参时复制 source；legacy 模式恒可用，复制成功后 copied 置真
  const isSupported = !!(navigator.clipboard && window.isSecureContext) || !!options.legacy
  const copy = async (value = options.source) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
    } else if (options.legacy) {
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    } else {
      throw new Error('clipboard unsupported')
    }
    text.value = value
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  }
  return { copy, text, copied, isSupported }
}

export const useRoute = () => router.currentRoute
export const useRouter = () => router

export const useTagsViewStore = () => ({
  delView: view => store.dispatch('tagsView/delView', view)
})
