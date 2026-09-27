import request from '@/utils/request'

export function getEmployeeChangeRecordList(employeeId) {
  return request({ url: '/hrm/employee/change-record/list', method: 'get', params: { employeeId }})
}
