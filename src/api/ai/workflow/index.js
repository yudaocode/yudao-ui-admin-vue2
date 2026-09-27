import request from '@/utils/request'

export function getWorkflowPage(params) {
  return request({ url: '/ai/workflow/page', method: 'get', params })
}

export function getWorkflow(id) {
  return request({ url: '/ai/workflow/get?id=' + id, method: 'get' })
}

export function createWorkflow(data) {
  return request({ url: '/ai/workflow/create', method: 'post', data })
}

export function updateWorkflow(data) {
  return request({ url: '/ai/workflow/update', method: 'put', data })
}

export function deleteWorkflow(id) {
  return request({ url: '/ai/workflow/delete?id=' + id, method: 'delete' })
}

export function testWorkflow(data) {
  return request({ url: '/ai/workflow/test', method: 'post', data })
}
