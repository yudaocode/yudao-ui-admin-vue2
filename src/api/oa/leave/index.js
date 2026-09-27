import request from '@/utils/request'

// 创建请假申请草稿
export function createLeaveApply(data) {
  return request({ url: '/oa/leave-apply/create', method: 'post', data })
}

// 查询本人请假申请分页
export function getLeaveApplyPage(params) {
  return request({ url: '/oa/leave-apply/page', method: 'get', params })
}

// 查询请假申请详情
export function getLeaveApply(id) {
  return request({ url: '/oa/leave-apply/get?id=' + id, method: 'get' })
}

// 修改请假申请草稿
export function updateLeaveApply(data) {
  return request({ url: '/oa/leave-apply/update', method: 'put', data })
}

// 提交请假申请
export function submitLeaveApply(id, startUserSelectAssignees) {
  return request({ url: '/oa/leave-apply/submit', method: 'post', data: { id, startUserSelectAssignees } })
}
