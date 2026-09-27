import request from '@/utils/request'

// ERP 销售订单 API
export const SaleOrderApi = {
  getSaleOrderPage: (params) => request({ url: '/erp/sale-order/page', method: 'get', params }),
  getSaleOrder: (id) => request({ url: '/erp/sale-order/get?id=' + id, method: 'get' }),
  createSaleOrder: (data) => request({ url: '/erp/sale-order/create', method: 'post', data }),
  updateSaleOrder: (data) => request({ url: '/erp/sale-order/update', method: 'put', data }),
  updateSaleOrderStatus: (id, status) => request({
    url: '/erp/sale-order/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteSaleOrder: (ids) => request({
    url: '/erp/sale-order/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportSaleOrder: (params) => request({
    url: '/erp/sale-order/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
