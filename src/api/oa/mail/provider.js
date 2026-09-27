import request from '@/utils/request'

// 查询服务配置精简列表
export function getSimpleMailProviderList() {
  return request({ url: '/oa/mail-provider/simple-list', method: 'get' })
}

// 查询服务配置列表
export function getMailProviderList(status) {
  return request({ url: '/oa/mail-provider/list', method: 'get', params: { status } })
}

// 查询服务配置
export function getMailProvider(id) {
  return request({ url: '/oa/mail-provider/get', method: 'get', params: { id } })
}

// 新增服务配置
export function createMailProvider(data) {
  return request({ url: '/oa/mail-provider/create', method: 'post', data })
}

// 修改服务配置
export function updateMailProvider(data) {
  return request({ url: '/oa/mail-provider/update', method: 'put', data })
}

// 删除服务配置
export function deleteMailProvider(id) {
  return request({ url: '/oa/mail-provider/delete', method: 'delete', params: { id } })
}
