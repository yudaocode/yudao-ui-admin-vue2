const state = {
  sidebar: {
    opened: localStorage.getItem("sidebarStatus")
      ? !!+localStorage.getItem("sidebarStatus")
      : true,
    withoutAnimation: false,
    hide: false,
  },
  device: "desktop",
  size: localStorage.getItem("size") || "medium",
  // 当前租户信息
  currentTenant: JSON.parse(localStorage.getItem("currentTenant") || '{"id": 0, "name": "系统租户"}'),
};

const mutations = {
  TOGGLE_SIDEBAR: (state) => {
    if (state.sidebar.hide) {
      return false;
    }
    state.sidebar.opened = !state.sidebar.opened;
    state.sidebar.withoutAnimation = false;
    if (state.sidebar.opened) {
      localStorage.setItem("sidebarStatus", 1);
    } else {
      localStorage.setItem("sidebarStatus", 0);
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    localStorage.setItem("sidebarStatus", 0);
    state.sidebar.opened = false;
    state.sidebar.withoutAnimation = withoutAnimation;
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device;
  },
  SET_SIZE: (state, size) => {
    state.size = size;
    localStorage.setItem("size", size);
  },
  SET_SIDEBAR_HIDE: (state, status) => {
    state.sidebar.hide = status;
  },
  SET_CURRENT_TENANT: (state, tenant) => {
    state.currentTenant = tenant;
    localStorage.setItem("currentTenant", JSON.stringify(tenant));
  },
};

const actions = {
  toggleSideBar({ commit }) {
    commit("TOGGLE_SIDEBAR");
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit("CLOSE_SIDEBAR", withoutAnimation);
  },
  toggleDevice({ commit }, device) {
    commit("TOGGLE_DEVICE", device);
  },
  setSize({ commit }, size) {
    commit("SET_SIZE", size);
  },
  toggleSideBarHide({ commit }, status) {
    commit("SET_SIDEBAR_HIDE", status);
  },
  setCurrentTenant({ commit }, tenant) {
    commit("SET_CURRENT_TENANT", tenant);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
