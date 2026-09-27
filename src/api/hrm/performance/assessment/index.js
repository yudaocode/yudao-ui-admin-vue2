import request from '@/utils/request'

export function addPerformancePlanEmployees(data) {
  return request({ url: '/hrm/performance/assessment/create-list', method: 'post', data })
}

export function removePerformancePlanEmployees(data) {
  return request({ url: '/hrm/performance/assessment/delete-list', method: 'delete', data })
}

export function getPerformanceAssessmentPage(params) {
  return request({ url: '/hrm/performance/assessment/page', method: 'get', params })
}

export function getPerformancePlanUnassignedEmployeeIdList(planId) {
  return request({
    url: '/hrm/performance/assessment/unassigned-employee-id-list',
    method: 'get',
    params: { planId }
  })
}

export function getPerformanceAssessment(id) {
  return request({ url: '/hrm/performance/assessment/get', method: 'get', params: { id }})
}

export function getPerformanceAssessmentProcessRecordList(id) {
  return request({
    url: '/hrm/performance/assessment/process-record-list',
    method: 'get',
    params: { id }
  })
}

export function getPerformanceAssessmentArchivePage(params) {
  return request({ url: '/hrm/performance/assessment/archive-page', method: 'get', params })
}

export function getPerformanceArchiveEmployeePage(params) {
  return request({
    url: '/hrm/performance/assessment/archive-employee-page',
    method: 'get',
    params
  })
}

export function getPerformanceAssessmentArchive(id) {
  return request({ url: '/hrm/performance/assessment/archive-get', method: 'get', params: { id }})
}

export function getPerformanceAssessmentArchiveProcessRecordList(id) {
  return request({
    url: '/hrm/performance/assessment/archive-process-record-list',
    method: 'get',
    params: { id }
  })
}

export function getPerformanceArchivePlanSimpleList() {
  return request({ url: '/hrm/performance/assessment/archive-plan-simple-list', method: 'get' })
}

export function deletePerformanceArchiveRecords(ids) {
  return request({
    url: '/hrm/performance/assessment/archive-delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

export function deletePerformanceArchiveEmployeeRecords(employeeIds) {
  return request({
    url: '/hrm/performance/assessment/archive-employee-delete',
    method: 'delete',
    params: { employeeIds: employeeIds.join(',') }
  })
}
