import request from '@/utils/request'

// WMS 入库单 API
export const ReceiptOrderApi = {
  getReceiptOrderPage: (params) => request({ url: '/wms/receipt-order/page', method: 'get', params }),
  getReceiptOrder: (id) => request({ url: '/wms/receipt-order/get?id=' + id, method: 'get' }),
  getReceiptOrderDetailListByOrderId: (orderId) => request({
    url: '/wms/receipt-order-detail/list-by-order-id?orderId=' + orderId,
    method: 'get'
  }),
  createReceiptOrder: (data) => request({ url: '/wms/receipt-order/create', method: 'post', data }),
  updateReceiptOrder: (data) => request({ url: '/wms/receipt-order/update', method: 'put', data }),
  completeReceiptOrder: (id) => request({ url: '/wms/receipt-order/complete?id=' + id, method: 'put' }),
  cancelReceiptOrder: (id) => request({ url: '/wms/receipt-order/cancel?id=' + id, method: 'put' }),
  deleteReceiptOrder: (id) => request({ url: '/wms/receipt-order/delete?id=' + id, method: 'delete' }),
  exportReceiptOrder: (params) => request({
    url: '/wms/receipt-order/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
