import request from '@/utils/request'

export const ProCardProcessApi = {
  getCardProcessPage: params =>
    request({ url: '/mes/pro/card-process/page', method: 'get', params }),
  getCardProcess: id => request({ url: '/mes/pro/card-process/get?id=' + id, method: 'get' }),
  createCardProcess: data => request({ url: '/mes/pro/card-process/create', method: 'post', data }),
  updateCardProcess: data => request({ url: '/mes/pro/card-process/update', method: 'put', data }),
  deleteCardProcess: id =>
    request({ url: '/mes/pro/card-process/delete?id=' + id, method: 'delete' })
}
