import request from '@/utils/request'

export const WmArrivalNoticeLineApi = {
  getArrivalNoticeLinePage: async(params) => request({ url: '/mes/wm/arrival-notice-line/page', method: 'get', params }),
  getArrivalNoticeLine: async(id) => request({ url: '/mes/wm/arrival-notice-line/get?id=' + id, method: 'get' }),
  createArrivalNoticeLine: async(data) => request({ url: '/mes/wm/arrival-notice-line/create', method: 'post', data }),
  updateArrivalNoticeLine: async(data) => request({ url: '/mes/wm/arrival-notice-line/update', method: 'put', data }),
  deleteArrivalNoticeLine: async(id) => request({ url: '/mes/wm/arrival-notice-line/delete?id=' + id, method: 'delete' })
}
