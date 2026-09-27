import request from '@/utils/request'

// WMS 出库单 API
export const ShipmentOrderApi = {
  getShipmentOrderPage: (params) => request({ url: '/wms/shipment-order/page', method: 'get', params }),
  getShipmentOrder: (id) => request({ url: '/wms/shipment-order/get?id=' + id, method: 'get' }),
  getShipmentOrderDetailListByOrderId: (orderId) => request({
    url: '/wms/shipment-order-detail/list-by-order-id?orderId=' + orderId,
    method: 'get'
  }),
  createShipmentOrder: (data) => request({ url: '/wms/shipment-order/create', method: 'post', data }),
  updateShipmentOrder: (data) => request({ url: '/wms/shipment-order/update', method: 'put', data }),
  completeShipmentOrder: (id) => request({ url: '/wms/shipment-order/complete?id=' + id, method: 'put' }),
  cancelShipmentOrder: (id) => request({ url: '/wms/shipment-order/cancel?id=' + id, method: 'put' }),
  deleteShipmentOrder: (id) => request({ url: '/wms/shipment-order/delete?id=' + id, method: 'delete' }),
  exportShipmentOrder: (params) => request({
    url: '/wms/shipment-order/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
