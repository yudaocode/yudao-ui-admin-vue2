import request from '@/utils/request'

export function createNextSalaryMonthRecord() {
  return request({ url: '/hrm/salary/month-record/create-next', method: 'post' })
}

export function computeSalaryMonthRecord(id) {
  return request({ url: '/hrm/salary/month-record/compute?id=' + id, method: 'post' })
}

export function computeSalaryMonthRecordWithImport(data) {
  return request({ url: '/hrm/salary/month-record/compute-import', method: 'post', data })
}

export function deleteSalaryMonthRecord(id) {
  return request({ url: '/hrm/salary/month-record/delete?id=' + id, method: 'delete' })
}

export function getSalaryMonthRecordPage(params) {
  return request({ url: '/hrm/salary/month-record/page', method: 'get', params })
}

export function getSalaryMonthRecord(id) {
  return request({ url: '/hrm/salary/month-record/get?id=' + id, method: 'get' })
}

export function getLastSalaryMonthRecord() {
  return request({ url: '/hrm/salary/month-record/last', method: 'get' })
}

export function getSalaryPayrollReadiness(monthRecordId) {
  return request({
    url: '/hrm/salary/month-record/payroll-readiness',
    method: 'get',
    params: { monthRecordId }
  })
}

export function getSalaryAttendanceImportTemplate(monthRecordId) {
  return request({
    url: '/hrm/salary/month-record/get-attendance-import-template',
    method: 'get',
    params: { monthRecordId },
    responseType: 'blob'
  })
}

export function getSalaryCumulativeTaxImportTemplate(monthRecordId) {
  return request({
    url: '/hrm/salary/month-record/get-cumulative-tax-import-template',
    method: 'get',
    params: { monthRecordId },
    responseType: 'blob'
  })
}

export function getSalaryAdditionalDeductionImportTemplate(monthRecordId) {
  return request({
    url: '/hrm/salary/month-record/get-additional-deduction-import-template',
    method: 'get',
    params: { monthRecordId },
    responseType: 'blob'
  })
}

export function getSalaryMonthOptionSummary(params) {
  return request({ url: '/hrm/salary/month-record/option-summary', method: 'get', params })
}
