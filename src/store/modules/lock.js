// 锁屏状态，持久化到 localStorage（key 与 Vue3 pinia persist 保持一致）
const cachedLock = (() => {
  try {
    return JSON.parse(localStorage.getItem('lock')) || {}
  } catch (e) {
    return {}
  }
})()

const state = {
  // lockInfo: {
  //   isLock: false, // 是否锁定屏幕
  //   password: '' // 锁屏密码
  // }
  lockInfo: cachedLock.lockInfo || {}
}

const mutations = {
  SET_LOCK_INFO: (state, lockInfo) => {
    state.lockInfo = lockInfo
  },
  RESET_LOCK_INFO: (state) => {
    state.lockInfo = {}
  }
}

const actions = {
  setLockInfo({ commit }, lockInfo) {
    commit('SET_LOCK_INFO', lockInfo)
  },
  resetLockInfo({ commit }) {
    commit('RESET_LOCK_INFO')
  },
  unLock({ state, dispatch }, password) {
    if (state.lockInfo && state.lockInfo.password === password) {
      dispatch('resetLockInfo')
      return true
    }
    return false
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
