import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import settings from './modules/settings'
import dict from './modules/dict'
import mallKefu from './modules/mallKefu'
import lock from './modules/lock'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    tagsView,
    permission,
    settings,
    dict,
    mallKefu,
    lock
  },
  getters
})

// 锁屏状态持久化，与 Vue3 pinia persist 行为保持一致
store.subscribe((mutation, state) => {
  if (mutation.type.indexOf('lock/') === 0) {
    localStorage.setItem('lock', JSON.stringify({ lockInfo: state.lock.lockInfo }))
  }
})

export default store
