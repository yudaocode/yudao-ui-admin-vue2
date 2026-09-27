import { constantRoutes } from '@/router'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import { toCamelCase } from '@/utils'

const permission = {
  state: {
    routes: [],
    addRoutes: [],
    sidebarRouters: [], // 左侧边菜单的路由，被 Sidebar/index.vue 使用
    topbarRouters: [] // 顶部菜单的路由，被 TopNav/index.vue 使用
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    SET_DEFAULT_ROUTES: (state, routes) => {
      state.defaultRoutes = constantRoutes.concat(routes)
    },
    SET_TOPBAR_ROUTES: (state, routes) => {
      state.topbarRouters = routes
    },
    SET_SIDEBAR_ROUTERS: (state, routes) => {
      state.sidebarRouters = routes
    }
  },
  actions: {
    /**
     * 生成路由
     *
     * @param commit commit 函数
     * @param menus  路由参数
     */
    GenerateRoutes({ commit }, menus) {
      return new Promise(resolve => {
        // 将 menus 菜单，转换为 route 路由数组
        const sdata = JSON.parse(JSON.stringify(menus)) // 【重要】用于菜单中的数据
        assignUniqueDirectoryNames(sdata)
        const rdata = JSON.parse(JSON.stringify(sdata)) // 与侧边栏使用相同的目录名称
        const sidebarRoutes = filterAsyncRouter(sdata)
        const rewriteRoutes = filterAsyncRouter(rdata, false, true)
        rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true })
        commit('SET_ROUTES', rewriteRoutes)
        commit('SET_SIDEBAR_ROUTERS', constantRoutes.concat(sidebarRoutes))
        commit('SET_DEFAULT_ROUTES', sidebarRoutes)
        commit('SET_TOPBAR_ROUTES', sidebarRoutes)
        resolve(rewriteRoutes)
      })
    }
  }
}

function getMenuRouteName(route) {
  if (route.componentName) return route.componentName
  return toCamelCase(route.path.split('/').pop(), true)
}

// 目录没有页面缓存标识；冲突时只给目录改名，保留页面的 componentName 和访问路径。
// 在扁平化前统一处理，确保菜单与 Router 中的名称一致。
function assignUniqueDirectoryNames(menus) {
  const names = new Map()
  const directories = []
  const reserve = name => {
    if (name) names.set(name, (names.get(name) || 0) + 1)
  }
  const walkStatic = routes => routes.forEach(route => {
    reserve(route.name)
    if (route.children) walkStatic(route.children)
  })
  const walkMenus = (routes, parentPath = '') => routes.forEach(route => {
    const fullPath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`
    const name = getMenuRouteName(route)
    reserve(name)
    if (route.children && route.children.length) {
      directories.push({ route, name, fullPath })
      walkMenus(route.children, fullPath)
    }
  })
  walkStatic(constantRoutes)
  walkMenus(menus)
  directories.forEach(({ route, name, fullPath }) => {
    if (names.get(name) < 2) return
    let candidate = `${name}Parent`
    if (names.has(candidate)) {
      candidate = fullPath.split('/').filter(Boolean).map(part => toCamelCase(part, true)).join('') + 'Parent'
    }
    const base = candidate
    let suffix = 2
    while (names.has(candidate)) candidate = `${base}${suffix++}`
    route.componentName = candidate
    reserve(candidate)
  })
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    // 将 ruoyi 后端原有耦合前端的逻辑，迁移到此处
    // 处理 meta 属性
    route.meta = {
      title: route.name,
      icon: route.icon,
      noCache: !route.keepAlive
    }
    route.hidden = !route.visible
    // 处理 name 属性
    route.name = getMenuRouteName(route)
    // 处理 component 属性
    if (route.children) { // 父节点
      if (route.parentId === 0) {
        route.component = Layout
      } else {
        route.component = ParentView
      }
    } else { // 根节点
      route.component = loadView(route.component)
    }

    // filterChildren
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
      route.alwaysShow = route.alwaysShow !== undefined ? route.alwaysShow : true
    } else {
      delete route['children']
      delete route['alwaysShow'] // 如果没有子菜单，就不需要考虑 alwaysShow 字段
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  let children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (!el.component && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

export const loadView = (view) => { // 路由懒加载
  return (resolve) => require([`@/views/${view}`], resolve)
}

export default permission
