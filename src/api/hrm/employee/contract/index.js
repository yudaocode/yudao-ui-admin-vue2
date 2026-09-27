import request from '@/utils/request'

export function getEmployeeContractList(employeeId) {
  return request({ url: '/hrm/employee/contract/list', method: 'get', params: { employeeId }})
}

export function createEmployeeContract(data) {
  return request({ url: '/hrm/employee/contract/create', method: 'post', data })
}

export function updateEmployeeContract(data) {
  return request({ url: '/hrm/employee/contract/update', method: 'put', data })
}

export function deleteEmployeeContract(id) {
  return request({ url: '/hrm/employee/contract/delete', method: 'delete', params: { id }})
}
