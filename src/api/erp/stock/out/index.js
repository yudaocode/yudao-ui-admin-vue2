import request from '@/utils/request'

// ERP 其它出库单 API
export const StockOutApi = {
  getStockOutPage: (params) => request({ url: '/erp/stock-out/page', method: 'get', params }),
  getStockOut: (id) => request({ url: '/erp/stock-out/get?id=' + id, method: 'get' }),
  createStockOut: (data) => request({ url: '/erp/stock-out/create', method: 'post', data }),
  updateStockOut: (data) => request({ url: '/erp/stock-out/update', method: 'put', data }),
  updateStockOutStatus: (id, status) => request({
    url: '/erp/stock-out/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteStockOut: (ids) => request({
    url: '/erp/stock-out/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportStockOut: (params) => request({
    url: '/erp/stock-out/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
