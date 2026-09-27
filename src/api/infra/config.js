import request from '@/utils/request'

// 查询参数列表
export function getConfigPage(params) {
  return request({ url: '/infra/config/page', method: 'get', params: params })
}

// 查询参数详情
export function getConfig(id) {
  return request({ url: '/infra/config/get?id=' + id, method: 'get' })
}

// 根据参数键名查询参数值
export function getConfigKey(configKey) {
  return request({ url: '/infra/config/get-value-by-key?key=' + configKey, method: 'get' })
}

// 新增参数
export function createConfig(data) {
  return request({ url: '/infra/config/create', method: 'post', data: data })
}

// 修改参数
export function updateConfig(data) {
  return request({ url: '/infra/config/update', method: 'put', data: data })
}

// 删除参数
export function deleteConfig(id) {
  return request({ url: '/infra/config/delete?id=' + id, method: 'delete' })
}

// 批量删除参数
export function deleteConfigList(ids) {
  return request({ url: '/infra/config/delete-list', method: 'delete', params: { ids: ids.join(',') } })
}

// 导出参数
export function exportConfig(params) {
  return request({ url: '/infra/config/export-excel', method: 'get', params: params, responseType: 'blob' })
}
