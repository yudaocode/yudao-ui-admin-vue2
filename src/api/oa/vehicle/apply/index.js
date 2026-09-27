import request from '@/utils/request'

// 查询用车申请分页
export function getVehicleApplyPage(params) {
  return request({ url: '/oa/vehicle-apply/page', method: 'get', params })
}

// 查询用车申请详情
export function getVehicleApply(id) {
  return request({ url: '/oa/vehicle-apply/get?id=' + id, method: 'get' })
}

// 查询用车申请可选车辆分页
export function getAvailableVehiclePage(params) {
  return request({ url: '/oa/vehicle-apply/vehicle-page', method: 'get', params })
}

// 新增用车申请
export function createVehicleApply(data) {
  return request({ url: '/oa/vehicle-apply/create', method: 'post', data })
}

// 修改用车申请
export function updateVehicleApply(data) {
  return request({ url: '/oa/vehicle-apply/update', method: 'put', data })
}

// 删除用车申请
export function deleteVehicleApply(id) {
  return request({ url: '/oa/vehicle-apply/delete?id=' + id, method: 'delete' })
}

// 提交用车申请
export function submitVehicleApply(id) {
  return request({ url: '/oa/vehicle-apply/submit?id=' + id, method: 'put' })
}

// 取消用车申请
export function cancelVehicleApply(id) {
  return request({ url: '/oa/vehicle-apply/cancel?id=' + id, method: 'put' })
}
