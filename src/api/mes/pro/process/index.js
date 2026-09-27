import request from '@/utils/request'

export const ProProcessApi = {
  getProcessPage: params => request({ url: '/mes/pro/process/page', method: 'get', params }),
  getProcessSimpleList: () => request({ url: '/mes/pro/process/simple-list', method: 'get' }),
  getProcess: id => request({ url: '/mes/pro/process/get?id=' + id, method: 'get' }),
  createProcess: data => request({ url: '/mes/pro/process/create', method: 'post', data }),
  updateProcess: data => request({ url: '/mes/pro/process/update', method: 'put', data }),
  deleteProcess: id => request({ url: '/mes/pro/process/delete?id=' + id, method: 'delete' }),
  exportProcess: params =>
    request({
      url: '/mes/pro/process/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
}
