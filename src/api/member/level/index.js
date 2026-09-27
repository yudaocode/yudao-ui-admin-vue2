import request from '@/utils/request'

export function getLevelList(params) {
  return request({ url: '/member/level/list', method: 'get', params })
}

export function getLevel(id) {
  return request({ url: '/member/level/get?id=' + id, method: 'get' })
}

export function getSimpleLevelList() {
  return request({ url: '/member/level/list-all-simple', method: 'get' })
}

export function createLevel(data) {
  return request({ url: '/member/level/create', method: 'post', data })
}

export function updateLevel(data) {
  return request({ url: '/member/level/update', method: 'put', data })
}

export function deleteLevel(id) {
  return request({ url: '/member/level/delete?id=' + id, method: 'delete' })
}
