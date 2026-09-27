import request from '@/utils/request'

// 查询车辆分页
export function getVehiclePage(params) {
  return request({ url: '/oa/vehicle/page', method: 'get', params })
}

// 查询车辆详情
export function getVehicle(id) {
  return request({ url: '/oa/vehicle/get?id=' + id, method: 'get' })
}

// 新增车辆
export function createVehicle(data) {
  return request({ url: '/oa/vehicle/create', method: 'post', data })
}

// 修改车辆
export function updateVehicle(data) {
  return request({ url: '/oa/vehicle/update', method: 'put', data })
}

// 删除车辆
export function deleteVehicle(id) {
  return request({ url: '/oa/vehicle/delete?id=' + id, method: 'delete' })
}
