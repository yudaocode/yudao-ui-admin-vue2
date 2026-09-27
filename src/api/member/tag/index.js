import request from '@/utils/request'

export function getMemberTagPage(params) {
  return request({ url: '/member/tag/page', method: 'get', params })
}

export function getMemberTag(id) {
  return request({ url: '/member/tag/get?id=' + id, method: 'get' })
}

export function getSimpleTagList() {
  return request({ url: '/member/tag/list-all-simple', method: 'get' })
}

export function createMemberTag(data) {
  return request({ url: '/member/tag/create', method: 'post', data })
}

export function updateMemberTag(data) {
  return request({ url: '/member/tag/update', method: 'put', data })
}

export function deleteMemberTag(id) {
  return request({ url: '/member/tag/delete?id=' + id, method: 'delete' })
}
