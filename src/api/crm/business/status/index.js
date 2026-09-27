import request from '@/utils/request'

export const DEFAULT_STATUSES = [
  { endStatus: 1, key: '结束', name: '赢单', percent: 100 },
  { endStatus: 2, key: '结束', name: '输单', percent: 0 },
  { endStatus: 3, key: '结束', name: '无效', percent: 0 }
]

export function getBusinessStatusPage(params) {
  return request({ url: '/crm/business-status/page', method: 'get', params })
}

export function createBusinessStatus(data) {
  return request({ url: '/crm/business-status/create', method: 'post', data })
}

export function updateBusinessStatus(data) {
  return request({ url: '/crm/business-status/update', method: 'put', data })
}

export function getBusinessStatus(id) {
  return request({ url: '/crm/business-status/get?id=' + id, method: 'get' })
}

export function deleteBusinessStatus(id) {
  return request({ url: '/crm/business-status/delete?id=' + id, method: 'delete' })
}

export function getBusinessStatusTypeSimpleList() {
  return request({ url: '/crm/business-status/type-simple-list', method: 'get' })
}

export function getBusinessStatusSimpleList(typeId) {
  return request({ url: '/crm/business-status/status-simple-list', method: 'get', params: { typeId } })
}
