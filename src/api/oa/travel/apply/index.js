import request from '@/utils/request'

// 获得本人出差申请分页
export function getTravelApplyPage(params) {
  return request({ url: '/oa/travel-apply/page', method: 'get', params })
}

// 获得本人已通过的出差申请
export function getApprovedTravelApplyList() {
  return request({ url: '/oa/travel-apply/approved-list', method: 'get' })
}

// 获得出差申请详情
export function getTravelApply(id) {
  return request({ url: '/oa/travel-apply/get?id=' + id, method: 'get' })
}

// 创建出差申请草稿
export function createTravelApply(data) {
  return request({ url: '/oa/travel-apply/create', method: 'post', data })
}

// 修改出差申请草稿
export function updateTravelApply(data) {
  return request({ url: '/oa/travel-apply/update', method: 'put', data })
}

// 提交出差申请
export function submitTravelApply(id) {
  return request({ url: '/oa/travel-apply/submit', method: 'post', data: { id } })
}

// 撤回出差申请
export function cancelTravelApply(id) {
  return request({ url: '/oa/travel-apply/cancel?id=' + id, method: 'put' })
}

// 删除出差申请
export function deleteTravelApply(id) {
  return request({ url: '/oa/travel-apply/delete?id=' + id, method: 'delete' })
}
