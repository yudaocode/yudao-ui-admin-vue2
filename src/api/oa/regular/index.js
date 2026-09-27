import request from '@/utils/request'

// 创建转正申请草稿
export function createRegularApply(data) {
  return request({ url: '/oa/regular-apply/create', method: 'post', data })
}

// 查询本人转正申请分页
export function getRegularApplyPage(params) {
  return request({ url: '/oa/regular-apply/page', method: 'get', params })
}

// 查询转正申请详情
export function getRegularApply(id) {
  return request({ url: '/oa/regular-apply/get?id=' + id, method: 'get' })
}

// 修改转正申请草稿
export function updateRegularApply(data) {
  return request({ url: '/oa/regular-apply/update', method: 'put', data })
}

// 提交转正申请
export function submitRegularApply(id, startUserSelectAssignees) {
  return request({ url: '/oa/regular-apply/submit', method: 'post', data: { id, startUserSelectAssignees } })
}
