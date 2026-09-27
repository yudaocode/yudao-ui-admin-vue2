import request from '@/utils/request'

// ERP 采购入库 API
export const PurchaseInApi = {
  getPurchaseInPage: (params) => request({ url: '/erp/purchase-in/page', method: 'get', params }),
  getPurchaseIn: (id) => request({ url: '/erp/purchase-in/get?id=' + id, method: 'get' }),
  createPurchaseIn: (data) => request({ url: '/erp/purchase-in/create', method: 'post', data }),
  updatePurchaseIn: (data) => request({ url: '/erp/purchase-in/update', method: 'put', data }),
  updatePurchaseInStatus: (id, status) => request({
    url: '/erp/purchase-in/update-status',
    method: 'put',
    params: { id, status }
  }),
  deletePurchaseIn: (ids) => request({
    url: '/erp/purchase-in/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportPurchaseIn: (params) => request({
    url: '/erp/purchase-in/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
