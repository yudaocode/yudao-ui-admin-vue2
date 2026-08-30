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
  // 兼容旧调用方：后端已移除 /get-bpmn-xml，改从流程定义详情中读取 bpmnXml。
  // 保持旧函数返回 response.data 为 XML 字符串，避免未迁移的外部调用方再次请求 404。
  return getProcessDefinition(id).then((response) => ({
    ...response,
    data: response.data && (response.data.bpmnXml || response.data.bpmnXML)
  }))
}
