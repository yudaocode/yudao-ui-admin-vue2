import request from '@/utils/request'

// ERP 库存调拨单 API
export const StockMoveApi = {
  getStockMovePage: (params) => request({ url: '/erp/stock-move/page', method: 'get', params }),
  getStockMove: (id) => request({ url: '/erp/stock-move/get?id=' + id, method: 'get' }),
  createStockMove: (data) => request({ url: '/erp/stock-move/create', method: 'post', data }),
  updateStockMove: (data) => request({ url: '/erp/stock-move/update', method: 'put', data }),
  updateStockMoveStatus: (id, status) => request({
    url: '/erp/stock-move/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteStockMove: (ids) => request({
    url: '/erp/stock-move/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportStockMove: (params) => request({
    url: '/erp/stock-move/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
