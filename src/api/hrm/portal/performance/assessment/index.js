import request from '@/utils/request'

export function getPerformanceAssessmentPage(params) {
  return request({ url: '/hrm/portal/performance/assessment/page', method: 'get', params })
}

export function getPerformanceAssessmentTaskCount(search) {
  return request({ url: '/hrm/portal/performance/assessment/task-count', method: 'get', params: { search }})
}

export function getPerformanceAssessment(id, stageId) {
  return request({ url: '/hrm/portal/performance/assessment/get', method: 'get', params: { id, stageId }})
}

export function getPerformanceAssessmentProcessRecordList(id, stageId) {
  return request({
    url: '/hrm/portal/performance/assessment/process-record-list',
    method: 'get',
    params: { id, stageId }
  })
}

export function getPerformanceAssessmentFillQuotaTaskPage(params) {
  return request({ url: '/hrm/portal/performance/assessment/fill-quota-task-page', method: 'get', params })
}

export function getPerformanceAssessmentTargetConfirmationTaskPage(params) {
  return request({ url: '/hrm/portal/performance/assessment/target-confirmation-task-page', method: 'get', params })
}

export function getPerformanceAssessmentReviewTaskPage(params) {
  return request({ url: '/hrm/portal/performance/assessment/review-task-page', method: 'get', params })
}

export function getPerformanceAssessmentResultAuditTaskPage(params) {
  return request({ url: '/hrm/portal/performance/assessment/result-audit-task-page', method: 'get', params })
}

export function getPerformanceAssessmentResultConfirmationTaskPage(params) {
  return request({ url: '/hrm/portal/performance/assessment/result-confirmation-task-page', method: 'get', params })
}

export function getPerformanceAssessmentAppealTaskPage(params) {
  return request({ url: '/hrm/portal/performance/assessment/appeal-task-page', method: 'get', params })
}

export function fillPerformanceAssessmentQuota(data) {
  return request({ url: '/hrm/portal/performance/assessment/fill-quota', method: 'put', data })
}

export function confirmPerformanceAssessmentTarget(data) {
  return request({ url: '/hrm/portal/performance/assessment/confirm-target', method: 'put', data })
}

export function previewPerformanceAssessmentScore(data) {
  return request({ url: '/hrm/portal/performance/assessment/score-preview', method: 'post', data })
}

export function scorePerformanceAssessment(data) {
  return request({ url: '/hrm/portal/performance/assessment/score', method: 'put', data })
}

export function rejectPerformanceAssessmentReviewStage(data) {
  return request({ url: '/hrm/portal/performance/assessment/reject-review-stage', method: 'put', data })
}

export function handlePerformanceAssessmentResultAudit(data) {
  return request({ url: '/hrm/portal/performance/assessment/handle-result-audit', method: 'put', data })
}

export function confirmPerformanceAssessmentResult(data) {
  return request({ url: '/hrm/portal/performance/assessment/confirm-result', method: 'put', data })
}

export function submitPerformanceAssessmentAppeal(data) {
  return request({ url: '/hrm/portal/performance/assessment/submit-appeal', method: 'put', data })
}

export function handlePerformanceAssessmentAppeal(data) {
  return request({ url: '/hrm/portal/performance/assessment/handle-appeal', method: 'put', data })
}
