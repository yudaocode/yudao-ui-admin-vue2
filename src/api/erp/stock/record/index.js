import request from '@/utils/request'

// ERP 产品库存明细 API
export const StockRecordApi = {
  getStockRecordPage: (params) => request({
    url: '/erp/stock-record/page',
    method: 'get',
    params
  }),
  getStockRecord: (id) => request({ url: '/erp/stock-record/get?id=' + id, method: 'get' }),
  exportStockRecord: (params) => request({
    url: '/erp/stock-record/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
