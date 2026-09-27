import request from '@/utils/request'

export function getSalaryChangeRecord(id) {
  return request({ url: '/hrm/salary/change-record/get', method: 'get', params: { id }})
}

export function getSalaryChangeRecordList(employeeId) {
  return request({ url: '/hrm/salary/change-record/list', method: 'get', params: { employeeId }})
}

export function cancelSalaryChangeRecord(id) {
  return request({ url: '/hrm/salary/change-record/cancel', method: 'put', params: { id }})
}

export function deleteSalaryChangeRecord(id) {
  return request({ url: '/hrm/salary/change-record/delete', method: 'delete', params: { id }})
}
