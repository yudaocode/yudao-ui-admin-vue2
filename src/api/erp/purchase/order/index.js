import request from '@/utils/request'

// 采购订单数据接口
export function getPurchaseOrderPage(query) {
  return request({
    url: '/erp/purchase-order/page',
    method: 'get',
    params: query
  })
}

export function getPurchaseOrder(id) {
  return request({
    url: '/erp/purchase-order/get?id=' + id,
    method: 'get'
  })
}

export function createPurchaseOrder(data) {
  return request({
    url: '/erp/purchase-order/create',
    method: 'post',
    data
  })
}

export function updatePurchaseOrder(data) {
  return request({
    url: '/erp/purchase-order/update',
    method: 'put',
    data
  })
}

export function updatePurchaseOrderStatus(id, status) {
  return request({
    url: '/erp/purchase-order/update-status',
    method: 'put',
    params: { id, status }
  })
}

export function deletePurchaseOrder(ids) {
  return request({
    url: '/erp/purchase-order/delete',
    method: 'delete',
    params: { ids: Array.isArray(ids) ? ids.join(',') : ids }
  })
}

export function exportPurchaseOrder(query) {
  return request({
    url: '/erp/purchase-order/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
