import request from '@/utils/request'

// ERP 销售出库 API
export const SaleOutApi = {
  getSaleOutPage: (params) => request({ url: '/erp/sale-out/page', method: 'get', params }),
  getSaleOut: (id) => request({ url: '/erp/sale-out/get?id=' + id, method: 'get' }),
  createSaleOut: (data) => request({ url: '/erp/sale-out/create', method: 'post', data }),
  updateSaleOut: (data) => request({ url: '/erp/sale-out/update', method: 'put', data }),
  updateSaleOutStatus: (id, status) => request({
    url: '/erp/sale-out/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteSaleOut: (ids) => request({
    url: '/erp/sale-out/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportSaleOut: (params) => request({
    url: '/erp/sale-out/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
