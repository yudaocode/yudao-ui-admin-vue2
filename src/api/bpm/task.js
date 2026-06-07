import request from '@/utils/request'

/**
 * 任务状态枚举
 */
export const TaskStatusEnum = {
  SKIP: -2, // 跳过
  NOT_START: -1, // 未开始
  WAIT: 0, // 待审批
  RUNNING: 1, // 审批中
  APPROVE: 2, // 审批通过
  REJECT: 3, // 审批不通过
  CANCEL: 4, // 已取消
  RETURN: 5, // 已退回
  APPROVING: 7 // 审批通过中
}

export function getTaskTodoPage(query) {
  return request({
    url: '/bpm/task/todo-page',
    method: 'get',
    params: query
  })
}

export function getTaskDonePage(query) {
  return request({
    url: '/bpm/task/done-page',
    method: 'get',
    params: query
  })
}

export function getTaskManagerPage(query) {
  return request({
    url: '/bpm/task/manager-page',
    method: 'get',
    params: query
  })
}

export function approveTask(data) {
  return request({
    url: '/bpm/task/approve',
    method: 'put',
    data: data
  })
}

export function rejectTask(data) {
  return request({
    url: '/bpm/task/reject',
    method: 'put',
    data: data
  })
}

export function getTaskListByProcessInstanceId(processInstanceId) {
  return request({
    url: '/bpm/task/list-by-process-instance-id?processInstanceId=' + processInstanceId,
    method: 'get'
  })
}

// 获取所有可退回的节点
export function getTaskListByReturn(id) {
  return request({
    url: '/bpm/task/list-by-return',
    method: 'get',
    params: { id }
  })
}

// 退回
export function returnTask(data) {
  return request({
    url: '/bpm/task/return',
    method: 'put',
    data: data
  })
}

// 委派
export function delegateTask(data) {
  return request({
    url: '/bpm/task/delegate',
    method: 'put',
    data: data
  })
}

// 转派
export function transferTask(data) {
  return request({
    url: '/bpm/task/transfer',
    method: 'put',
    data: data
  })
}

// 加签
export function signCreateTask(data) {
  return request({
    url: '/bpm/task/create-sign',
    method: 'put',
    data: data
  })
}

// 减签
export function signDeleteTask(data) {
  return request({
    url: '/bpm/task/delete-sign',
    method: 'delete',
    data: data
  })
}

// 抄送
export function copyTask(data) {
  return request({
    url: '/bpm/task/copy',
    method: 'put',
    data: data
  })
}

// 撤回
export function withdrawTask(taskId) {
  return request({
    url: '/bpm/task/withdraw',
    method: 'put',
    params: { taskId }
  })
}

// 获取我的待办任务
export function myTodoTask(processInstanceId) {
  return request({
    url: '/bpm/task/my-todo?processInstanceId=' + processInstanceId,
    method: 'get'
  })
}

// 获取减签任务列表
export function getChildrenTaskList(id) {
  return request({
    url: '/bpm/task/list-by-parent-task-id?parentTaskId=' + id,
    method: 'get'
  })
}
