import request from '@/utils/request'

export const WmArrivalNoticeApi = {
  getArrivalNoticePage: async(params) => request({ url: '/mes/wm/arrival-notice/page', method: 'get', params }),
  getArrivalNotice: async(id) => request({ url: '/mes/wm/arrival-notice/get?id=' + id, method: 'get' }),
  createArrivalNotice: async(data) => request({ url: '/mes/wm/arrival-notice/create', method: 'post', data }),
  updateArrivalNotice: async(data) => request({ url: '/mes/wm/arrival-notice/update', method: 'put', data }),
  deleteArrivalNotice: async(id) => request({ url: '/mes/wm/arrival-notice/delete?id=' + id, method: 'delete' }),
  submitArrivalNotice: async(id) => request({ url: '/mes/wm/arrival-notice/submit?id=' + id, method: 'put' }),
  exportArrivalNotice: async(params) => request({ url: '/mes/wm/arrival-notice/export-excel', method: 'get', params, responseType: 'blob' })
}
