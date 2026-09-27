import request from '@/utils/request'

export const WmSalesNoticeLineApi = {
  getSalesNoticeLinePage: async(params) => request({ url: '/mes/wm/sales-notice-line/page', method: 'get', params }),
  getSalesNoticeLine: async(id) => request({ url: '/mes/wm/sales-notice-line/get?id=' + id, method: 'get' }),
  createSalesNoticeLine: async(data) => request({ url: '/mes/wm/sales-notice-line/create', method: 'post', data }),
  updateSalesNoticeLine: async(data) => request({ url: '/mes/wm/sales-notice-line/update', method: 'put', data }),
  deleteSalesNoticeLine: async(id) => request({ url: '/mes/wm/sales-notice-line/delete?id=' + id, method: 'delete' })
}
