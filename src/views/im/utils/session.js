import { isPositiveId, parseId } from '@/utils/id'
import store from '@/store'

export function getCurrentUserId() {
  const id = parseId(store.getters.userId)
  return isPositiveId(id) ? id : 0
}
