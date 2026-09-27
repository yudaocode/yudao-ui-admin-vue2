import request from '@/utils/request'

export const ProAndonRecordApi = {
  getAndonRecordPage: params =>
    request({ url: '/mes/pro/andon-record/page', method: 'get', params }),
  getAndonRecord: id => request({ url: '/mes/pro/andon-record/get?id=' + id, method: 'get' }),
  createAndonRecord: data => request({ url: '/mes/pro/andon-record/create', method: 'post', data }),
  deleteAndonRecord: id =>
    request({ url: '/mes/pro/andon-record/delete?id=' + id, method: 'delete' }),
  updateAndonRecord: data => request({ url: '/mes/pro/andon-record/update', method: 'put', data }),
  exportAndonRecord: params =>
    request({
      url: '/mes/pro/andon-record/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
}
