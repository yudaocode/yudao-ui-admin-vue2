import request from '@/utils/request'

export const MdWorkstationApi = {
  getWorkstationPage: params => request({ url: '/mes/md-workstation/page', method: 'get', params }),
  getWorkstation: id => request({ url: '/mes/md-workstation/get?id=' + id, method: 'get' }),
  createWorkstation: data => request({ url: '/mes/md-workstation/create', method: 'post', data }),
  updateWorkstation: data => request({ url: '/mes/md-workstation/update', method: 'put', data }),
  deleteWorkstation: id =>
    request({ url: '/mes/md-workstation/delete?id=' + id, method: 'delete' }),
  exportWorkstation: params =>
    request({
      url: '/mes/md-workstation/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
}
