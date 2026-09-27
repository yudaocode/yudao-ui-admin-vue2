import request from '@/utils/request'

export function createPerformanceAssessmentTemplate(data) {
  return request({ url: '/hrm/performance/assessment-template/create', method: 'post', data })
}

export function updatePerformanceAssessmentTemplate(data) {
  return request({ url: '/hrm/performance/assessment-template/update', method: 'put', data })
}

export function deletePerformanceAssessmentTemplate(id) {
  return request({
    url: '/hrm/performance/assessment-template/delete',
    method: 'delete',
    params: { id }
  })
}

export function deletePerformanceAssessmentTemplateList(ids) {
  return request({
    url: '/hrm/performance/assessment-template/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

export function getPerformanceAssessmentTemplate(id) {
  return request({
    url: '/hrm/performance/assessment-template/get',
    method: 'get',
    params: { id }
  })
}

export function getPerformanceAssessmentTemplatePage(params) {
  return request({ url: '/hrm/performance/assessment-template/page', method: 'get', params })
}

export function getPerformanceAssessmentTemplateSimpleList() {
  return request({ url: '/hrm/performance/assessment-template/simple-list', method: 'get' })
}
