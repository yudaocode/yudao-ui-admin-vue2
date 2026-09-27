import request from '@/utils/request'

export function getManagerPrivateMessagePage(params) {
  return request({ url: '/im/manager/message/private/page', method: 'get', params })
}

export function getManagerPrivateMessage(id) {
  return request({ url: '/im/manager/message/private/get', method: 'get', params: { id }})
}
