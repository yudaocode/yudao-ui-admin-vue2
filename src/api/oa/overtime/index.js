import request from '@/utils/request'

// 创建加班申请草稿
export function createOvertimeApply(data) {
  return request({ url: '/oa/overtime-apply/create', method: 'post', data })
}

// 查询本人加班申请分页
export function getOvertimeApplyPage(params) {
  return request({ url: '/oa/overtime-apply/page', method: 'get', params })
}

// 查询加班申请详情
export function getOvertimeApply(id) {
  return request({ url: '/oa/overtime-apply/get?id=' + id, method: 'get' })
}

// 修改加班申请草稿
export function updateOvertimeApply(data) {
  return request({ url: '/oa/overtime-apply/update', method: 'put', data })
}

// 提交加班申请
export function submitOvertimeApply(id, startUserSelectAssignees) {
  return request({ url: '/oa/overtime-apply/submit', method: 'post', data: { id, startUserSelectAssignees } })
}
