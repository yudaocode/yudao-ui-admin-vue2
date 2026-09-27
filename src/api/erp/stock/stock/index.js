import request from '@/utils/request'

// ERP 产品库存 API
export const StockApi = {
  getStockPage: (params) => request({ url: '/erp/stock/page', method: 'get', params }),
  getStock: (id) => request({ url: '/erp/stock/get?id=' + id, method: 'get' }),
  getStock2: (productId, warehouseId) => request({
    url: '/erp/stock/get',
    method: 'get',
    params: { productId, warehouseId }
  }),
  getStockCount: (productId) => request({
    url: '/erp/stock/get-count',
    method: 'get',
    params: { productId }
  }),
  exportStock: (params) => request({
    url: '/erp/stock/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
