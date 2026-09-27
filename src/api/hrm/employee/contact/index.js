import request from '@/utils/request'

export function getEmployeeContactList(employeeId) {
  return request({ url: '/hrm/employee/contact/list', method: 'get', params: { employeeId }})
}

export function createEmployeeContact(data) {
  return request({ url: '/hrm/employee/contact/create', method: 'post', data })
}

export function updateEmployeeContact(data) {
  return request({ url: '/hrm/employee/contact/update', method: 'put', data })
}

export function deleteEmployeeContact(id) {
  return request({ url: '/hrm/employee/contact/delete', method: 'delete', params: { id }})
}
