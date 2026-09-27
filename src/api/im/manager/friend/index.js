import request from '@/utils/request'

export function getManagerFriendPage(params) {
  return request({ url: '/im/manager/friend/page', method: 'get', params })
}
