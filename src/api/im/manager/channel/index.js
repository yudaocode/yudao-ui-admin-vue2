import request from '@/utils/request'

export function getManagerChannelPage(params) {
  return request({ url: '/im/manager/channel/page', method: 'get', params })
}

export function getManagerChannel(id) {
  return request({ url: '/im/manager/channel/get', method: 'get', params: { id }})
}

export function createManagerChannel(data) {
  return request({ url: '/im/manager/channel/create', method: 'post', data })
}

export function updateManagerChannel(data) {
  return request({ url: '/im/manager/channel/update', method: 'put', data })
}

export function deleteManagerChannel(id) {
  return request({ url: '/im/manager/channel/delete', method: 'delete', params: { id }})
}

export function getSimpleChannelList() {
  return request({ url: '/im/manager/channel/simple-list', method: 'get' })
}
