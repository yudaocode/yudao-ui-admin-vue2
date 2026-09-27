import request from '@/utils/request'

export function getManagerSensitiveWordPage(params) {
  return request({ url: '/im/manager/sensitive-word/page', method: 'get', params })
}

export function getManagerSensitiveWord(id) {
  return request({ url: '/im/manager/sensitive-word/get', method: 'get', params: { id }})
}

export function createManagerSensitiveWord(data) {
  return request({ url: '/im/manager/sensitive-word/create', method: 'post', data })
}

export function updateManagerSensitiveWord(data) {
  return request({ url: '/im/manager/sensitive-word/update', method: 'put', data })
}

export function deleteManagerSensitiveWord(id) {
  return request({ url: '/im/manager/sensitive-word/delete', method: 'delete', params: { id }})
}

export function deleteManagerSensitiveWordList(ids) {
  return request({ url: '/im/manager/sensitive-word/delete-list', method: 'delete', params: { ids: ids.join(',') }})
}
