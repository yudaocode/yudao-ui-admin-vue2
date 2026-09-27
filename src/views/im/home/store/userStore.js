import store from '@/store'

export function useUserStore() {
  return {
    get getUser() {
      return {
        id: store.getters.userId,
        nickname: store.getters.nickname || store.getters.name,
        avatar: store.getters.avatar
      }
    },
    get user() {
      return this.getUser
    }
  }
}
