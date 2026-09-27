import request from '@/utils/request'

export function getManagerFriendRequestPage(params) {
  return request({ url: '/im/manager/friend-request/page', method: 'get', params })
}
