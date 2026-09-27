import request from '@/utils/request'

export function createSalaryGroup(data) {
  return request({ url: '/hrm/salary/group/create', method: 'post', data })
}

export function updateSalaryGroup(data) {
  return request({ url: '/hrm/salary/group/update', method: 'put', data })
}

export function deleteSalaryGroup(id) {
  return request({ url: '/hrm/salary/group/delete?id=' + id, method: 'delete' })
}

export function getSalaryGroup(id) {
  return request({ url: '/hrm/salary/group/get?id=' + id, method: 'get' })
}

export function getSalaryGroupPage(params) {
  return request({ url: '/hrm/salary/group/page', method: 'get', params })
}

export function getSalaryGroupSimpleList() {
  return request({ url: '/hrm/salary/group/simple-list', method: 'get' })
}
