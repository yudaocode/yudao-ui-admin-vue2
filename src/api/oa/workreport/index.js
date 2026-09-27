import request from '@/utils/request'

// 查询工作汇报分页
export function getWorkReportPage(params) {
  return request({ url: '/oa/work-report/page', method: 'get', params })
}

// 查询工作汇报详情
export function getWorkReport(id) {
  return request({ url: '/oa/work-report/get?id=' + id, method: 'get' })
}

// 新增工作汇报
export function createWorkReport(data) {
  return request({ url: '/oa/work-report/create', method: 'post', data })
}

// 修改工作汇报
export function updateWorkReport(data) {
  return request({ url: '/oa/work-report/update', method: 'put', data })
}

// 删除工作汇报
export function deleteWorkReport(id) {
  return request({ url: '/oa/work-report/delete?id=' + id, method: 'delete' })
}

// 提交工作汇报
export function submitWorkReport(id) {
  return request({ url: '/oa/work-report/submit?id=' + id, method: 'put' })
}

// 撤销工作汇报
export function cancelWorkReport(id) {
  return request({ url: '/oa/work-report/cancel?id=' + id, method: 'put' })
}

// 查询工作汇报统计
export function getWorkReportStatistics(params) {
  return request({ url: '/oa/work-report/statistics', method: 'get', params })
}
