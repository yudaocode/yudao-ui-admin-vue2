import request from '@/utils/request'

// 创建离职申请草稿
export function createResignApply(data) {
  return request({ url: '/oa/resign-apply/create', method: 'post', data })
}

// 查询本人离职申请分页
export function getResignApplyPage(params) {
  return request({ url: '/oa/resign-apply/page', method: 'get', params })
}

// 查询离职申请详情
export function getResignApply(id) {
  return request({ url: '/oa/resign-apply/get?id=' + id, method: 'get' })
}

// 修改离职申请草稿
export function updateResignApply(data) {
  return request({ url: '/oa/resign-apply/update', method: 'put', data })
}

// 提交离职申请
export function submitResignApply(id, startUserSelectAssignees) {
  return request({ url: '/oa/resign-apply/submit', method: 'post', data: { id, startUserSelectAssignees } })
}
