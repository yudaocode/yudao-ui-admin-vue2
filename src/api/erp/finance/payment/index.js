import request from '@/utils/request'

// ERP 付款单 API
export const FinancePaymentApi = {
  getFinancePaymentPage: (params) => request({ url: '/erp/finance-payment/page', method: 'get', params }),
  getFinancePayment: (id) => request({ url: '/erp/finance-payment/get?id=' + id, method: 'get' }),
  createFinancePayment: (data) => request({ url: '/erp/finance-payment/create', method: 'post', data }),
  updateFinancePayment: (data) => request({ url: '/erp/finance-payment/update', method: 'put', data }),
  updateFinancePaymentStatus: (id, status) => request({
    url: '/erp/finance-payment/update-status',
    method: 'put',
    params: { id, status }
  }),
  deleteFinancePayment: (ids) => request({
    url: '/erp/finance-payment/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  }),
  exportFinancePayment: (params) => request({
    url: '/erp/finance-payment/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
