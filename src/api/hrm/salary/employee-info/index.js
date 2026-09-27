import request from '@/utils/request'

export function getSalaryEmployeeInfoPage(params) {
  return request({ url: '/hrm/salary/employee-info/page', method: 'get', params })
}

export function getSalaryEmployeeInfoStatusCount(params) {
  return request({ url: '/hrm/salary/employee-info/status-count', method: 'get', params })
}

export function getSalaryEmployeeInfo(employeeId) {
  return request({ url: '/hrm/salary/employee-info/get', method: 'get', params: { employeeId }})
}

export function getSalaryAdjustmentMinEffectDate() {
  return request({ url: '/hrm/salary/employee-info/get-adjustment-min-effect-date', method: 'get' })
}

export function updateSalaryEmployeeInfo(data) {
  return request({ url: '/hrm/salary/employee-info/update', method: 'put', data })
}

export function updateSalaryEmployeeInfoList(data) {
  return request({ url: '/hrm/salary/employee-info/update-list', method: 'put', data })
}

export function getFixSalaryImportTemplate() {
  return request({ url: '/hrm/salary/employee-info/get-fix-import-template', method: 'get', responseType: 'blob' })
}

export function getChangeSalaryImportTemplate() {
  return request({ url: '/hrm/salary/employee-info/get-change-import-template', method: 'get', responseType: 'blob' })
}
