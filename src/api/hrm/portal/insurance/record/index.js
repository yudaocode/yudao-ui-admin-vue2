import request from '@/utils/request'

export function getInsuranceRecordList(params) {
  return request({ url: '/hrm/portal/insurance/record/list', method: 'get', params })
}

export function getInsuranceRecord(id) {
  return request({ url: '/hrm/portal/insurance/record/get', method: 'get', params: { id }})
}
