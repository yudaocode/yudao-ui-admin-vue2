import request from '@/utils/request'

// WMS 盘库单 API
export const CheckOrderApi = {
  getCheckOrderPage: (params) => request({ url: '/wms/check-order/page', method: 'get', params }),
  getCheckOrder: (id) => request({ url: '/wms/check-order/get?id=' + id, method: 'get' }),
  getCheckOrderDetailListByOrderId: (orderId) => request({
    url: '/wms/check-order-detail/list-by-order-id?orderId=' + orderId,
    method: 'get'
  }),
  createCheckOrder: (data) => request({ url: '/wms/check-order/create', method: 'post', data }),
  updateCheckOrder: (data) => request({ url: '/wms/check-order/update', method: 'put', data }),
  completeCheckOrder: (id) => request({ url: '/wms/check-order/complete?id=' + id, method: 'put' }),
  cancelCheckOrder: (id) => request({ url: '/wms/check-order/cancel?id=' + id, method: 'put' }),
  deleteCheckOrder: (id) => request({ url: '/wms/check-order/delete?id=' + id, method: 'delete' }),
  exportCheckOrder: (params) => request({
    url: '/wms/check-order/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
