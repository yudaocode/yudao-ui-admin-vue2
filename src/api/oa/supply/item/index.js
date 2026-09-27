import request from '@/utils/request'

// 查询办公用品分页
export function getSupplyItemPage(params) {
  return request({ url: '/oa/supply-item/page', method: 'get', params })
}

// 查询可领用物品分页
export function getSupplyItemSelectPage(params) {
  return request({ url: '/oa/supply-item/select-page', method: 'get', params })
}

// 查询办公用品详情
export function getSupplyItem(id) {
  return request({ url: '/oa/supply-item/get?id=' + id, method: 'get' })
}

// 新增办公用品
export function createSupplyItem(data) {
  return request({ url: '/oa/supply-item/create', method: 'post', data })
}

// 修改办公用品
export function updateSupplyItem(data) {
  return request({ url: '/oa/supply-item/update', method: 'put', data })
}

// 删除办公用品
export function deleteSupplyItem(id) {
  return request({ url: '/oa/supply-item/delete?id=' + id, method: 'delete' })
}

// 办公用品入库
export function stockInSupplyItem(id, quantity) {
  return request({ url: '/oa/supply-item/stock-in', method: 'put', data: { id, quantity } })
}
