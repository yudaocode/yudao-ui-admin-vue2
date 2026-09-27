import request from '@/utils/request'

// ERP 收款单 API
export const FinanceReceiptApi = {
  getFinanceReceiptPage: (params) => request({ url: '/erp/finance-receipt/page', method: 'get', params }),
  getFinanceReceipt: (id) => request({ url: '/erp/finance-receipt/get?id=' + id, method: 'get' }),
  createFinanceReceipt: (data) => request({ url: '/erp/finance-receipt/create', method: 'post', data }),
  updateFinanceReceipt: (data) => request({ url: '/erp/finance-receipt/update', method: 'put', data }),
  updateFinanceReceiptStatus: (id, status) => request({
    url: '/erp/finance-receipt/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteFinanceReceipt: (ids) => request({
    url: '/erp/finance-receipt/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportFinanceReceipt: (params) => request({
    url: '/erp/finance-receipt/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
