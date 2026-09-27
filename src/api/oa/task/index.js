import request from '@/utils/request'

// 查询我发布的任务分页
export function getPublishedTaskPage(params) {
  return request({ url: '/oa/task/published-page', method: 'get', params })
}

// 查询我接收的任务分页
export function getReceivedTaskPage(params) {
  return request({ url: '/oa/task/received-page', method: 'get', params })
}

// 查询任务详情
export function getTask(id) {
  return request({ url: '/oa/task/get?id=' + id, method: 'get' })
}

// 新增任务
export function createTask(data) {
  return request({ url: '/oa/task/create', method: 'post', data })
}

// 修改任务
export function updateTask(data) {
  return request({ url: '/oa/task/update', method: 'put', data })
}

// 删除发布的任务
export function deleteTask(id) {
  return request({ url: '/oa/task/delete?id=' + id, method: 'delete' })
}

// 删除接收的任务
export function deleteReceivedTask(id) {
  return request({ url: '/oa/task/delete-received?id=' + id, method: 'delete' })
}

// 任务反馈
export function feedbackTask(data) {
  return request({ url: '/oa/task/feedback', method: 'post', data })
}

// 查询任务状态数量
export function getTaskStatusCount() {
  return request({ url: '/oa/task/get-status-count', method: 'get' })
}

// 查询完成任务排名
export function getCompletedTaskRanking() {
  return request({ url: '/oa/task/get-completed-ranking', method: 'get' })
}
