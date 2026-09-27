import request from '@/utils/request'

export function sendSalarySlip(data) {
  return request({ url: '/hrm/salary/slip-send-record/create', method: 'post', data })
}

export function getSalarySlipSendEmployeePage(params) {
  return request({ url: '/hrm/salary/slip-send-record/employee-page', method: 'get', params })
}

export function deleteSalarySlipSendRecord(id) {
  return request({ url: '/hrm/salary/slip-send-record/delete?id=' + id, method: 'delete' })
}

export function getSalarySlipSendRecordPage(params) {
  return request({ url: '/hrm/salary/slip-send-record/page', method: 'get', params })
}

export function getSalarySlipSendRecord(id) {
  return request({ url: '/hrm/salary/slip-send-record/get?id=' + id, method: 'get' })
}
