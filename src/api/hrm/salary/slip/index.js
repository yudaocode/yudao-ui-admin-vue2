import request from '@/utils/request'

export function getSalarySlipPage(params) {
  return request({ url: '/hrm/salary/slip/page', method: 'get', params })
}

export function getSalarySlip(id) {
  return request({ url: '/hrm/salary/slip/get?id=' + id, method: 'get' })
}

export function updateSalarySlipRemark(data) {
  return request({ url: '/hrm/salary/slip/remark', method: 'put', data })
}
