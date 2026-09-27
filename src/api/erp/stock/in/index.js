import request from '@/utils/request'

// ERP 其它入库单 API
export const StockInApi = {
  getStockInPage: (params) => request({ url: '/erp/stock-in/page', method: 'get', params }),
  getStockIn: (id) => request({ url: '/erp/stock-in/get?id=' + id, method: 'get' }),
  createStockIn: (data) => request({ url: '/erp/stock-in/create', method: 'post', data }),
  updateStockIn: (data) => request({ url: '/erp/stock-in/update', method: 'put', data }),
  updateStockInStatus: (id, status) => request({
    url: '/erp/stock-in/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteStockIn: (ids) => request({
    url: '/erp/stock-in/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportStockIn: (params) => request({
    url: '/erp/stock-in/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
