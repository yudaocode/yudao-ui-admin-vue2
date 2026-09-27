import request from '@/utils/request'

export function getEmployeeQuitInfo(employeeId) {
  return request({ url: '/hrm/employee/quit-info/get', method: 'get', params: { employeeId }})
}
