import request from '@/utils/request'

export function createSalarySlipTemplate(data) {
  return request({ url: '/hrm/salary/slip-template/create', method: 'post', data })
}

export function updateSalarySlipTemplate(data) {
  return request({ url: '/hrm/salary/slip-template/update', method: 'put', data })
}

export function deleteSalarySlipTemplate(id) {
  return request({ url: '/hrm/salary/slip-template/delete?id=' + id, method: 'delete' })
}

export function getSalarySlipTemplate(id) {
  return request({ url: '/hrm/salary/slip-template/get?id=' + id, method: 'get' })
}

export function getSalarySlipTemplateList() {
  return request({ url: '/hrm/salary/slip-template/list', method: 'get' })
}
