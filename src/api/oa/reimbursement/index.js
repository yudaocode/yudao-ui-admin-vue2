import request from '@/utils/request'

// 创建费用报销草稿
export function createReimbursement(data) {
  return request({ url: '/oa/reimbursement/create', method: 'post', data })
}

// 查询本人费用报销分页
export function getReimbursementPage(params) {
  return request({ url: '/oa/reimbursement/page', method: 'get', params })
}

// 查询费用报销详情
export function getReimbursement(id) {
  return request({ url: '/oa/reimbursement/get?id=' + id, method: 'get' })
}

// 修改费用报销草稿
export function updateReimbursement(data) {
  return request({ url: '/oa/reimbursement/update', method: 'put', data })
}

// 提交费用报销
export function submitReimbursement(id, startUserSelectAssignees) {
  return request({ url: '/oa/reimbursement/submit', method: 'post', data: { id, startUserSelectAssignees } })
}
