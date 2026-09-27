import request from '@/utils/request'

export function createSalaryTaxRule(data) {
  return request({ url: '/hrm/salary/tax-rule/create', method: 'post', data })
}

export function updateSalaryTaxRule(data) {
  return request({ url: '/hrm/salary/tax-rule/update', method: 'put', data })
}

export function deleteSalaryTaxRule(id) {
  return request({ url: '/hrm/salary/tax-rule/delete?id=' + id, method: 'delete' })
}

export function getSalaryTaxRule(id) {
  return request({ url: '/hrm/salary/tax-rule/get?id=' + id, method: 'get' })
}

export function getSalaryTaxRuleList() {
  return request({ url: '/hrm/salary/tax-rule/list', method: 'get' })
}
