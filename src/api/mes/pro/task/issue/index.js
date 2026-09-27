import request from '@/utils/request'

export const ProTaskIssueApi = {
  getTaskIssuePage: params => request({ url: '/mes/pro/task-issue/page', method: 'get', params }),
  getTaskIssue: id => request({ url: '/mes/pro/task-issue/get?id=' + id, method: 'get' }),
  createTaskIssue: data => request({ url: '/mes/pro/task-issue/create', method: 'post', data }),
  updateTaskIssue: data => request({ url: '/mes/pro/task-issue/update', method: 'put', data }),
  deleteTaskIssue: id =>
    request({ url: '/mes/pro/task-issue/delete?id=' + id, method: 'delete' }),
  getTaskIssueListByTask: taskId =>
    request({ url: '/mes/pro/task-issue/list-by-task?taskId=' + taskId, method: 'get' })
}
