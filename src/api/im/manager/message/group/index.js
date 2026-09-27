import request from '@/utils/request'

export function getManagerGroupMessagePage(params) {
  return request({ url: '/im/manager/message/group/page', method: 'get', params })
}

export function getManagerGroupMessage(id) {
  return request({ url: '/im/manager/message/group/get', method: 'get', params: { id }})
}
