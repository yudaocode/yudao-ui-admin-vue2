import request from '@/utils/request'

// ERP 销售退货 API
export const SaleReturnApi = {
  getSaleReturnPage: (params) => request({ url: '/erp/sale-return/page', method: 'get', params }),
  getSaleReturn: (id) => request({ url: '/erp/sale-return/get?id=' + id, method: 'get' }),
  createSaleReturn: (data) => request({ url: '/erp/sale-return/create', method: 'post', data }),
  updateSaleReturn: (data) => request({ url: '/erp/sale-return/update', method: 'put', data }),
  updateSaleReturnStatus: (id, status) => request({
    url: '/erp/sale-return/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteSaleReturn: (ids) => request({
    url: '/erp/sale-return/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportSaleReturn: (params) => request({
    url: '/erp/sale-return/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
