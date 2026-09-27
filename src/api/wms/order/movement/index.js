import request from '@/utils/request'

// WMS 移库单 API
export const MovementOrderApi = {
  getMovementOrderPage: (params) => request({ url: '/wms/movement-order/page', method: 'get', params }),
  getMovementOrder: (id) => request({ url: '/wms/movement-order/get?id=' + id, method: 'get' }),
  getMovementOrderDetailListByOrderId: (orderId) => request({
    url: '/wms/movement-order-detail/list-by-order-id?orderId=' + orderId,
    method: 'get'
  }),
  createMovementOrder: (data) => request({ url: '/wms/movement-order/create', method: 'post', data }),
  updateMovementOrder: (data) => request({ url: '/wms/movement-order/update', method: 'put', data }),
  completeMovementOrder: (id) => request({ url: '/wms/movement-order/complete?id=' + id, method: 'put' }),
  cancelMovementOrder: (id) => request({ url: '/wms/movement-order/cancel?id=' + id, method: 'put' }),
  deleteMovementOrder: (id) => request({ url: '/wms/movement-order/delete?id=' + id, method: 'delete' }),
  exportMovementOrder: (params) => request({
    url: '/wms/movement-order/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
