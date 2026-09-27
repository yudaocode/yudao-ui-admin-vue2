import request from '@/utils/request'

// 查询工作计划分页
export function getPlanPage(params) {
  return request({ url: '/oa/plan/page', method: 'get', params })
}

// 查询工作计划报表分页
export function getPlanReportPage(params) {
  return request({ url: '/oa/plan/report-page', method: 'get', params })
}

// 查询工作计划详情
export function getPlan(id) {
  return request({ url: '/oa/plan/get?id=' + id, method: 'get' })
}

// 新增工作计划
export function createPlan(data) {
  return request({ url: '/oa/plan/create', method: 'post', data })
}

// 修改工作计划
export function updatePlan(data) {
  return request({ url: '/oa/plan/update', method: 'put', data })
}

// 删除工作计划
export function deletePlan(id) {
  return request({ url: '/oa/plan/delete?id=' + id, method: 'delete' })
}

// 点评工作计划
export function addPlanComment(id, comment) {
  return request({ url: '/oa/plan/add-comment', method: 'put', data: { id, comment } })
}
