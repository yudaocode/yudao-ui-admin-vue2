import request from '@/utils/request'

export function getEmployeeCertificateList(employeeId) {
  return request({ url: '/hrm/employee/certificate/list', method: 'get', params: { employeeId }})
}

export function createEmployeeCertificate(data) {
  return request({ url: '/hrm/employee/certificate/create', method: 'post', data })
}

export function updateEmployeeCertificate(data) {
  return request({ url: '/hrm/employee/certificate/update', method: 'put', data })
}

export function deleteEmployeeCertificate(id) {
  return request({ url: '/hrm/employee/certificate/delete', method: 'delete', params: { id }})
}
