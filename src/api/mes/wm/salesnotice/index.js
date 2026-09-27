import request from '@/utils/request'

export const WmSalesNoticeApi = {
  getSalesNoticePage: async(params) => request({ url: '/mes/wm/sales-notice/page', method: 'get', params }),
  getSalesNotice: async(id) => request({ url: '/mes/wm/sales-notice/get?id=' + id, method: 'get' }),
  createSalesNotice: async(data) => request({ url: '/mes/wm/sales-notice/create', method: 'post', data }),
  updateSalesNotice: async(data) => request({ url: '/mes/wm/sales-notice/update', method: 'put', data }),
  deleteSalesNotice: async(id) => request({ url: '/mes/wm/sales-notice/delete?id=' + id, method: 'delete' }),
  submitSalesNotice: async(id) => request({ url: '/mes/wm/sales-notice/submit?id=' + id, method: 'put' }),
  exportSalesNotice: async(params) => request({ url: '/mes/wm/sales-notice/export-excel', method: 'get', params, responseType: 'blob' })
}
