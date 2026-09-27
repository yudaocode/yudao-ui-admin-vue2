import request from '@/utils/request'

export function getSalaryChangeTemplateList() {
  return request({ url: '/hrm/salary/change-template/list', method: 'get' })
}

export function getSalaryChangeTemplate(id) {
  return request({ url: '/hrm/salary/change-template/get?id=' + id, method: 'get' })
}

export function createSalaryChangeTemplate(data) {
  return request({ url: '/hrm/salary/change-template/create', method: 'post', data })
}

export function updateSalaryChangeTemplate(data) {
  return request({ url: '/hrm/salary/change-template/update', method: 'put', data })
}

export function deleteSalaryChangeTemplate(id) {
  return request({ url: '/hrm/salary/change-template/delete?id=' + id, method: 'delete' })
}
