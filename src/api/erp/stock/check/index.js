import request from '@/utils/request'

// ERP 库存盘点单 API
export const StockCheckApi = {
  getStockCheckPage: (params) => request({ url: '/erp/stock-check/page', method: 'get', params }),
  getStockCheck: (id) => request({ url: '/erp/stock-check/get?id=' + id, method: 'get' }),
  createStockCheck: (data) => request({ url: '/erp/stock-check/create', method: 'post', data }),
  updateStockCheck: (data) => request({ url: '/erp/stock-check/update', method: 'put', data }),
  updateStockCheckStatus: (id, status) => request({
    url: '/erp/stock-check/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteStockCheck: (ids) => request({
    url: '/erp/stock-check/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportStockCheck: (params) => request({
    url: '/erp/stock-check/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
