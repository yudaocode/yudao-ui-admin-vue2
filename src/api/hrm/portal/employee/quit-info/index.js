import request from '@/utils/request'

export function getEmployeeQuitInfo() {
  return request({ url: '/hrm/portal/employee/quit-info/get', method: 'get' })
}
