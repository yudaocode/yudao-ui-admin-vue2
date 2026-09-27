import request from '@/utils/request'

export function sendManagerChannelMessage(data) {
  return request({ url: '/im/manager/channel-message/send', method: 'post', data })
}

export function deleteManagerChannelMessage(id) {
  return request({ url: '/im/manager/channel-message/delete', method: 'delete', params: { id }})
}

export function getManagerChannelMessagePage(params) {
  return request({ url: '/im/manager/channel-message/page', method: 'get', params })
}
