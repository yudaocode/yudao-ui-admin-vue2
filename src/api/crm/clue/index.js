import request from '@/utils/request'

// CRM 线索 API（与 Vue3 端保持同一资源路径）
export function getCluePage(params) {
  return request({ url: '/crm/clue/page', method: 'get', params })
}

export function getClue(id) {
  return request({ url: '/crm/clue/get?id=' + id, method: 'get' })
}

export function createClue(data) {
  return request({ url: '/crm/clue/create', method: 'post', data })
}

export function updateClue(data) {
  return request({ url: '/crm/clue/update', method: 'put', data })
}

export function deleteClue(id) {
  return request({ url: '/crm/clue/delete?id=' + id, method: 'delete' })
}

export function exportClue(params) {
  return request({ url: '/crm/clue/export-excel', method: 'get', params, responseType: 'blob' })
}

export function transferClue(data) {
  return request({ url: '/crm/clue/transfer', method: 'put', data })
}

export function transformClue(id) {
  return request({ url: '/crm/clue/transform', method: 'put', params: { id } })
}

export function getFollowClueCount() {
  return request({ url: '/crm/clue/follow-count', method: 'get' })
}
