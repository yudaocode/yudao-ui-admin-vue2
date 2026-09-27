import request from '@/utils/request'

export const ProTaskApi = {
  getTaskPage: params => request({ url: '/mes/pro/task/page', method: 'get', params }),
  getTask: id => request({ url: '/mes/pro/task/get?id=' + id, method: 'get' }),
  createTask: data => request({ url: '/mes/pro/task/create', method: 'post', data }),
  updateTask: data => request({ url: '/mes/pro/task/update', method: 'put', data }),
  deleteTask: id => request({ url: '/mes/pro/task/delete?id=' + id, method: 'delete' }),
  exportTask: params =>
    request({
      url: '/mes/pro/task/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    }),
  getGanttTaskList: params => request({ url: '/mes/pro/task/gantt-list', method: 'get', params })
}
