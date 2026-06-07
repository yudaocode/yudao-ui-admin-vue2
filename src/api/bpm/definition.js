import request from '@/utils/request'

export function getProcessDefinition(id, key) {
  return request({
    url: '/bpm/process-definition/get',
    method: 'get',
    params: { id, key }
  })
}

export function getProcessDefinitionPage(query) {
  return request({
    url: '/bpm/process-definition/page',
    method: 'get',
    params: query
  })
}

export function getProcessDefinitionList(query) {
  return request({
    url: '/bpm/process-definition/list',
    method: 'get',
    params: query
  })
}

export function getSimpleProcessDefinitionList() {
  return request({
    url: '/bpm/process-definition/simple-list',
    method: 'get'
  })
}

export function getProcessDefinitionBpmnXML(id) {
  return request({
    url: '/bpm/process-definition/get-bpmn-xml?id=' + id,
    method: 'get'
  })
}
