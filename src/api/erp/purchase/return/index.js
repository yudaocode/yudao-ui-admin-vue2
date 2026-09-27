import request from '@/utils/request'

// ERP 采购退货 API
export const PurchaseReturnApi = {
  getPurchaseReturnPage: (params) => request({ url: '/erp/purchase-return/page', method: 'get', params }),
  getPurchaseReturn: (id) => request({ url: '/erp/purchase-return/get?id=' + id, method: 'get' }),
  createPurchaseReturn: (data) => request({ url: '/erp/purchase-return/create', method: 'post', data }),
  updatePurchaseReturn: (data) => request({ url: '/erp/purchase-return/update', method: 'put', data }),
  updatePurchaseReturnStatus: (id, status) => request({
    url: '/erp/purchase-return/update-status',
    method: 'put',
    params: { id, status }
  }),
  deletePurchaseReturn: (ids) => request({
    url: '/erp/purchase-return/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportPurchaseReturn: (params) => request({
    url: '/erp/purchase-return/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
