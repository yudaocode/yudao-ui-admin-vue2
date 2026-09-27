import request from '@/utils/request'

// 查询本人用印申请分页
export function getSealApplyPage(params) {
  return request({ url: '/oa/seal-apply/page', method: 'get', params })
}

// 查询用印申请详情
export function getSealApply(id) {
  return request({ url: '/oa/seal-apply/get?id=' + id, method: 'get' })
}

// 查询可申请的印章分页
export function getSealPage(params) {
  return request({ url: '/oa/seal-apply/seal-page', method: 'get', params })
}

// 新增用印申请
export function createSealApply(data) {
  return request({ url: '/oa/seal-apply/create', method: 'post', data })
}

// 修改用印申请
export function updateSealApply(data) {
  return request({ url: '/oa/seal-apply/update', method: 'put', data })
}

// 删除用印草稿
export function deleteSealApply(id) {
  return request({ url: '/oa/seal-apply/delete?id=' + id, method: 'delete' })
}

// 提交用印申请
export function submitSealApply(id) {
  return request({ url: '/oa/seal-apply/submit?id=' + id, method: 'put' })
}

// 撤销用印申请
export function cancelSealApply(id) {
  return request({ url: '/oa/seal-apply/cancel?id=' + id, method: 'put' })
}
