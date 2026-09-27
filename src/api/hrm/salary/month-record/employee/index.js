import request from '@/utils/request'

export function updateSalaryMonthEmployeeRecordList(data) {
  return request({ url: '/hrm/salary/month-employee-record/update-list', method: 'put', data })
}

export function getSalaryMonthEmployeeRecordPage(params) {
  return request({ url: '/hrm/salary/month-employee-record/page', method: 'get', params })
}

export function getSalaryEmployeeMonthRecordPage(params) {
  return request({ url: '/hrm/salary/month-employee-record/employee-page', method: 'get', params })
}

export function getSalaryMonthEmployeeRecordList(params) {
  return request({ url: '/hrm/salary/month-employee-record/list', method: 'get', params })
}

export function getSalaryMonthEmployeeChangeCount(params) {
  return request({ url: '/hrm/salary/month-employee-record/change-count', method: 'get', params })
}

export function getSalaryPerformanceCoefficients(data) {
  return request({ url: '/hrm/salary/month-employee-record/performance-coefficients', method: 'post', data })
}
