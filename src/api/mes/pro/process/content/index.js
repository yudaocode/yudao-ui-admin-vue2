import request from '@/utils/request'

export const ProProcessContentApi = {
  getProcessContentListByProcessId: processId =>
    request({
      url: '/mes/pro/process-content/list-by-process?processId=' + processId,
      method: 'get'
    }),
  getProcessContent: id =>
    request({ url: '/mes/pro/process-content/get?id=' + id, method: 'get' }),
  createProcessContent: data =>
    request({ url: '/mes/pro/process-content/create', method: 'post', data }),
  updateProcessContent: data =>
    request({ url: '/mes/pro/process-content/update', method: 'put', data }),
  deleteProcessContent: id =>
    request({ url: '/mes/pro/process-content/delete?id=' + id, method: 'delete' })
}
