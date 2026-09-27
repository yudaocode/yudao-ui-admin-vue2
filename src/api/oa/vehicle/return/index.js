import request from '@/utils/request'

// 查询还车申请分页
export function getVehicleReturnPage(params) {
  return request({ url: '/oa/vehicle-return/page', method: 'get', params })
}

// 查询还车申请详情
export function getVehicleReturn(id) {
  return request({ url: '/oa/vehicle-return/get?id=' + id, method: 'get' })
}

// 新增还车申请
export function createVehicleReturn(data) {
  return request({ url: '/oa/vehicle-return/create', method: 'post', data })
}

// 修改还车申请
export function updateVehicleReturn(data) {
  return request({ url: '/oa/vehicle-return/update', method: 'put', data })
}

// 删除还车申请
export function deleteVehicleReturn(id) {
  return request({ url: '/oa/vehicle-return/delete?id=' + id, method: 'delete' })
}

// 提交还车申请
export function submitVehicleReturn(id) {
  return request({ url: '/oa/vehicle-return/submit?id=' + id, method: 'put' })
}

// 取消还车申请
export function cancelVehicleReturn(id) {
  return request({ url: '/oa/vehicle-return/cancel?id=' + id, method: 'put' })
}
