import request from '@/utils/request'

// 查询流程监听器分页
export function getProcessListenerPage(query) {
  return request({
    url: '/bpm/process-listener/page',
    method: 'get',
    params: query
  })
}

// 查询流程监听器详情
export function getProcessListener(id) {
  return request({
    url: '/bpm/process-listener/get?id=' + id,
    method: 'get'
  })
}

// 新增流程监听器
export function createProcessListener(data) {
  return request({
    url: '/bpm/process-listener/create',
    method: 'post',
    data: data
  })
}

// 修改流程监听器
export function updateProcessListener(data) {
  return request({
    url: '/bpm/process-listener/update',
    method: 'put',
    data: data
  })
}

// 删除流程监听器
export function deleteProcessListener(id) {
  return request({
    url: '/bpm/process-listener/delete?id=' + id,
    method: 'delete'
  })
}
