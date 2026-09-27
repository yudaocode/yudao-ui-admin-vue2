import request from '@/utils/request'

export function createSalaryOption(data) {
  return request({ url: '/hrm/salary/option/create', method: 'post', data })
}

export function updateSalaryOptionEnabled(id, enabled) {
  return request({ url: '/hrm/salary/option/update-enabled', method: 'put', data: { id, enabled }})
}

export function updateSalaryOptionVisible(id, visible) {
  return request({ url: '/hrm/salary/option/update-visible', method: 'put', data: { id, visible }})
}

export function deleteSalaryOption(id) {
  return request({ url: '/hrm/salary/option/delete?id=' + id, method: 'delete' })
}

export function syncSalaryOption() {
  return request({ url: '/hrm/salary/option/sync', method: 'put' })
}

export function getSalaryOptionList() {
  return request({ url: '/hrm/salary/option/list', method: 'get' })
}

export function getSalaryOptionSimpleList(adjustable) {
  return request({ url: '/hrm/salary/option/simple-list', method: 'get', params: { adjustable }})
}
