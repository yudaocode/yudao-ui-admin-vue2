import request from '@/utils/request'

export function createPerformanceResultTemplate(data) {
  return request({ url: '/hrm/performance/result-template/create', method: 'post', data })
}

export function updatePerformanceResultTemplate(data) {
  return request({ url: '/hrm/performance/result-template/update', method: 'put', data })
}

export function deletePerformanceResultTemplate(id) {
  return request({ url: '/hrm/performance/result-template/delete', method: 'delete', params: { id }})
}

export function deletePerformanceResultTemplateList(ids) {
  return request({
    url: '/hrm/performance/result-template/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

export function getPerformanceResultTemplate(id) {
  return request({ url: '/hrm/performance/result-template/get', method: 'get', params: { id }})
}

export function getPerformanceResultTemplatePage(params) {
  return request({ url: '/hrm/performance/result-template/page', method: 'get', params })
}

export function getPerformanceResultTemplateSimpleList(params) {
  return request({ url: '/hrm/performance/result-template/simple-list', method: 'get', params })
}
