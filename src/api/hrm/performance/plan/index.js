import request from '@/utils/request'

export function createPerformancePlan(data) {
  return request({ url: '/hrm/performance/plan/create', method: 'post', data })
}

export function updatePerformancePlan(data) {
  return request({ url: '/hrm/performance/plan/update', method: 'put', data })
}

export function deletePerformancePlan(id) {
  return request({ url: '/hrm/performance/plan/delete', method: 'delete', params: { id }})
}

export function getPerformancePlan(id) {
  return request({ url: '/hrm/performance/plan/get', method: 'get', params: { id }})
}

export function getPerformancePlanPage(params) {
  return request({ url: '/hrm/performance/plan/page', method: 'get', params })
}

export function startPerformancePlan(id) {
  return request({ url: '/hrm/performance/plan/start', method: 'post', params: { id }})
}

export function openPerformancePlanScoring(id) {
  return request({ url: '/hrm/performance/plan/open-scoring', method: 'post', params: { id }})
}

export function startPerformancePlanInterview(id) {
  return request({ url: '/hrm/performance/plan/start-interview', method: 'post', params: { id }})
}

export function archivePerformancePlan(id) {
  return request({ url: '/hrm/performance/plan/archive', method: 'post', params: { id }})
}

export function terminatePerformancePlan(id) {
  return request({ url: '/hrm/performance/plan/terminate', method: 'post', params: { id }})
}

export function getPerformancePlanStatusCount(params) {
  return request({ url: '/hrm/performance/plan/status-count', method: 'get', params })
}

export function getPerformancePlanStageCount(planId) {
  return request({ url: '/hrm/performance/plan/stage-count', method: 'get', params: { planId }})
}

export function getPerformancePlanLevelCount(planId) {
  return request({ url: '/hrm/performance/plan/level-count', method: 'get', params: { planId }})
}
