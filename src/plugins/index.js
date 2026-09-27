import tab from './tab'
import auth from './auth'
import cache from './cache'
import modal from './modal'
import download from './download'

const translations = Object.freeze({
  'common.createSuccess': '新增成功',
  'common.updateSuccess': '修改成功',
  'common.delSuccess': '删除成功',
  'common.copySuccess': '复制成功',
  'common.copyError': '复制失败',
  'action.create': '新增',
  'action.add': '新增',
  'action.del': '删除',
  'action.delete': '删除',
  'action.edit': '编辑',
  'action.update': '编辑',
  'action.preview': '预览',
  'action.more': '更多',
  'action.sync': '同步',
  'action.save': '保存',
  'action.detail': '详情',
  'action.export': '导出',
  'action.import': '导入',
  'action.generate': '生成',
  'action.logout': '强制退出',
  'action.test': '测试',
  'action.typeCreate': '字典类型新增',
  'action.typeUpdate': '字典类型编辑',
  'action.dataCreate': '字典数据新增',
  'action.dataUpdate': '字典数据编辑'
})

export function translate(key) {
  return translations[key] || key
}

export default {
  install(Vue) {
    // 页签操作
    Vue.prototype.$tab = tab
    // 认证对象
    Vue.prototype.$auth = auth
    // 缓存对象
    Vue.prototype.$cache = cache
    // 模态框对象
    Vue.prototype.$modal = modal
    // 下载文件
    Vue.prototype.$download = download
    Vue.prototype.$t = translate
  }
}
