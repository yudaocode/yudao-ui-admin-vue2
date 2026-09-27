import request from '@/utils/request'

export function getManagerGroupPage(params) {
  return request({ url: '/im/manager/group/page', method: 'get', params })
}

export function getManagerGroup(id) {
  return request({ url: '/im/manager/group/get', method: 'get', params: { id }})
}

export function banManagerGroup(data) {
  return request({ url: '/im/manager/group/ban', method: 'put', data })
}

export function unbanManagerGroup(id) {
  return request({ url: '/im/manager/group/unban', method: 'put', params: { id }})
}

export function dissolveManagerGroup(id) {
  return request({ url: '/im/manager/group/dissolve', method: 'delete', params: { id }})
}

export function getManagerGroupMemberList(groupId) {
  return request({ url: '/im/manager/group/member/list', method: 'get', params: { groupId }})
}
