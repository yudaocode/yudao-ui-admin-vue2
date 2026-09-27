import request from '@/utils/request'

// 查询套红模板分页
export function getTemplatePage(params) {
  return request({ url: '/oa/officialdoc-template/page', method: 'get', params })
}

// 查询套红模板
export function getTemplate(id) {
  return request({ url: '/oa/officialdoc-template/get?id=' + id, method: 'get' })
}

// 新增套红模板
export function createTemplate(data) {
  return request({ url: '/oa/officialdoc-template/create', method: 'post', data })
}

// 修改套红模板
export function updateTemplate(data) {
  return request({ url: '/oa/officialdoc-template/update', method: 'put', data })
}

// 删除套红模板
export function deleteTemplate(id) {
  return request({ url: '/oa/officialdoc-template/delete?id=' + id, method: 'delete' })
}

// 查询套红模板精简列表
export function getSimpleTemplateList() {
  return request({ url: '/oa/officialdoc-template/simple-list', method: 'get' })
}
