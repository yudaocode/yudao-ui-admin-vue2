import request from '@/utils/request'

export const ProAndonConfigApi = {
  getAndonConfigPage: params =>
    request({ url: '/mes/pro/andon-config/page', method: 'get', params }),
  getAndonConfigList: () => request({ url: '/mes/pro/andon-config/list', method: 'get' }),
  getAndonConfig: id => request({ url: '/mes/pro/andon-config/get?id=' + id, method: 'get' }),
  createAndonConfig: data => request({ url: '/mes/pro/andon-config/create', method: 'post', data }),
  updateAndonConfig: data => request({ url: '/mes/pro/andon-config/update', method: 'put', data }),
  deleteAndonConfig: id =>
    request({ url: '/mes/pro/andon-config/delete?id=' + id, method: 'delete' })
}
