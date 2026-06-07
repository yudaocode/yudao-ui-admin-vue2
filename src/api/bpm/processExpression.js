import request from '@/utils/request'

// 查询流程表达式分页
export function getProcessExpressionPage(query) {
  return request({
    url: '/bpm/process-expression/page',
    method: 'get',
    params: query
  })
}

// 查询流程表达式详情
export function getProcessExpression(id) {
  return request({
    url: '/bpm/process-expression/get?id=' + id,
    method: 'get'
  })
}

// 新增流程表达式
export function createProcessExpression(data) {
  return request({
    url: '/bpm/process-expression/create',
    method: 'post',
    data: data
  })
}

// 修改流程表达式
export function updateProcessExpression(data) {
  return request({
    url: '/bpm/process-expression/update',
    method: 'put',
    data: data
  })
}

// 删除流程表达式
export function deleteProcessExpression(id) {
  return request({
    url: '/bpm/process-expression/delete?id=' + id,
    method: 'delete'
  })
}

// 导出流程表达式 Excel
export function exportProcessExpression(query) {
  return request({
    url: '/bpm/process-expression/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
