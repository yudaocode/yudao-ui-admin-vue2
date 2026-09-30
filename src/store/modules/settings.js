import defaultSettings from '@/settings'

const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle,
  breadcrumb, hamburger, screenfull, size, message, im, uniqueOpened, footer, greyMode } = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''
const state = {
  title: '',
  theme: storageSetting.theme || '#409EFF',
  sideTheme: storageSetting.sideTheme || sideTheme,
  showSettings: showSettings,
  topNav:  storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
  tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
  fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
  sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
  dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,
  breadcrumb: storageSetting.breadcrumb === undefined ? breadcrumb : storageSetting.breadcrumb,
  hamburger: storageSetting.hamburger === undefined ? hamburger : storageSetting.hamburger,
  screenfull: storageSetting.screenfull === undefined ? screenfull : storageSetting.screenfull,
  size: storageSetting.size === undefined ? size : storageSetting.size,
  message: storageSetting.message === undefined ? message : storageSetting.message,
  im: storageSetting.im === undefined ? im : storageSetting.im,
  uniqueOpened: storageSetting.uniqueOpened === undefined ? uniqueOpened : storageSetting.uniqueOpened,
  footer: storageSetting.footer === undefined ? footer : storageSetting.footer,
  greyMode: storageSetting.greyMode === undefined ? greyMode : storageSetting.greyMode
}
const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  // 修改布局设置
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  // 设置网页标题
  setTitle({ commit }, title) {
    state.title = title
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

