import request from '@/utils/request'

// 获得本人出差报销分页
export function getTravelReimbursementPage(params) {
  return request({ url: '/oa/travel-reimbursement/page', method: 'get', params })
}

// 获得出差报销详情
export function getTravelReimbursement(id) {
  return request({ url: '/oa/travel-reimbursement/get?id=' + id, method: 'get' })
}

// 创建出差报销草稿
export function createTravelReimbursement(data) {
  return request({ url: '/oa/travel-reimbursement/create', method: 'post', data })
}

// 修改出差报销草稿
export function updateTravelReimbursement(data) {
  return request({ url: '/oa/travel-reimbursement/update', method: 'put', data })
}

// 提交出差报销
export function submitTravelReimbursement(id) {
  return request({ url: '/oa/travel-reimbursement/submit', method: 'post', data: { id } })
}

// 撤回出差报销
export function cancelTravelReimbursement(id) {
  return request({ url: '/oa/travel-reimbursement/cancel?id=' + id, method: 'put' })
}

// 删除出差报销
export function deleteTravelReimbursement(id) {
  return request({ url: '/oa/travel-reimbursement/delete?id=' + id, method: 'delete' })
}
