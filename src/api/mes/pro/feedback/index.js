import request from '@/utils/request'

export const ProFeedbackApi = {
  getFeedbackPage: params => request({ url: '/mes/pro/feedback/page', method: 'get', params }),
  getFeedback: id => request({ url: '/mes/pro/feedback/get?id=' + id, method: 'get' }),
  createFeedback: data => request({ url: '/mes/pro/feedback/create', method: 'post', data }),
  updateFeedback: data => request({ url: '/mes/pro/feedback/update', method: 'put', data }),
  deleteFeedback: id => request({ url: '/mes/pro/feedback/delete?id=' + id, method: 'delete' }),
  exportFeedback: params =>
    request({
      url: '/mes/pro/feedback/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    }),
  submitFeedback: id => request({ url: '/mes/pro/feedback/submit?id=' + id, method: 'put' }),
  rejectFeedback: id => request({ url: '/mes/pro/feedback/reject?id=' + id, method: 'put' }),
  approveFeedback: id => request({ url: '/mes/pro/feedback/approve?id=' + id, method: 'put' })
}
