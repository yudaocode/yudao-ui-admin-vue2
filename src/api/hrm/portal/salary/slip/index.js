import request from '@/utils/request'

export function getSalarySlipList(params) {
  return request({ url: '/hrm/portal/salary/slip/list', method: 'get', params })
}

export function getUnreadSalarySlipSummary() {
  return request({ url: '/hrm/portal/salary/slip/unread-summary', method: 'get' })
}

export function markSalarySlipRead(ids) {
  return request({ url: '/hrm/portal/salary/slip/read', method: 'put', params: { ids: ids.join(',') }})
}
