import store from '@/store'

export function getCurrentUserId() {
  const id = Number(store.getters.userId)
  return Number.isFinite(id) && id > 0 ? id : 0
}
