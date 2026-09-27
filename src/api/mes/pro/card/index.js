import request from '@/utils/request'

export const ProCardApi = {
  getCardPage: params => request({ url: '/mes/pro/card/page', method: 'get', params }),
  getCard: id => request({ url: '/mes/pro/card/get?id=' + id, method: 'get' }),
  createCard: data => request({ url: '/mes/pro/card/create', method: 'post', data }),
  updateCard: data => request({ url: '/mes/pro/card/update', method: 'put', data }),
  deleteCard: id => request({ url: '/mes/pro/card/delete?id=' + id, method: 'delete' }),
  exportCard: params =>
    request({
      url: '/mes/pro/card/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    }),
  submitCard: id => request({ url: '/mes/pro/card/submit?id=' + id, method: 'put' }),
  finishCard: id => request({ url: '/mes/pro/card/finish?id=' + id, method: 'put' }),
  cancelCard: id => request({ url: '/mes/pro/card/cancel?id=' + id, method: 'put' })
}
