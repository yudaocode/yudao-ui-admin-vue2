import request from '@/utils/request'

export function getEmployeeBindStatus() {
  return request({ url: '/hrm/portal/employee/get-bind-status', method: 'get' })
}

export function getEmployee() {
  return request({ url: '/hrm/portal/employee/get', method: 'get' })
}

export function updateEmployee(data) {
  return request({ url: '/hrm/portal/employee/update', method: 'put', data })
}
