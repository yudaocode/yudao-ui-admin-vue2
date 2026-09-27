import request from '@/utils/request'

// 创建首月社保表
export function createFirstInsuranceMonthRecord(data) {
  return request({ url: '/hrm/insurance/month-record/create-first', method: 'post', data })
}

// 新建次月社保表
export function createNextInsuranceMonthRecord() {
  return request({ url: '/hrm/insurance/month-record/create-next', method: 'post' })
}

// 删除月度社保表
export function deleteInsuranceMonthRecord(id) {
  return request({ url: '/hrm/insurance/month-record/delete?id=' + id, method: 'delete' })
}

// 查询月度社保表详情
export function getInsuranceMonthRecord(id) {
  return request({ url: '/hrm/insurance/month-record/get?id=' + id, method: 'get' })
}

// 查询最近月度社保表
export function getLastInsuranceMonthRecord() {
  return request({ url: '/hrm/insurance/month-record/last', method: 'get' })
}

// 查询月度社保表列表
export function getInsuranceMonthRecordList(year) {
  return request({ url: '/hrm/insurance/month-record/list', method: 'get', params: { year }})
}
