import request from '@/utils/request'

export function getEmployeeSalaryCard(employeeId) {
  return request({ url: '/hrm/employee/salary-card/get', method: 'get', params: { employeeId }})
}

export function saveEmployeeSalaryCard(data) {
  return request({ url: '/hrm/employee/salary-card/save', method: 'put', data })
}

export function deleteEmployeeSalaryCard(employeeId) {
  return request({ url: '/hrm/employee/salary-card/delete', method: 'delete', params: { employeeId }})
}
