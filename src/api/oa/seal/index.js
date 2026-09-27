import request from '@/utils/request'

// 查询印章分页
export function getSealPage(params) {
  return request({ url: '/oa/seal/page', method: 'get', params })
}

// 查询印章详情
export function getSeal(id) {
  return request({ url: '/oa/seal/get?id=' + id, method: 'get' })
}

// 新增印章
export function createSeal(data) {
  return request({ url: '/oa/seal/create', method: 'post', data })
}

// 修改印章
export function updateSeal(data) {
  return request({ url: '/oa/seal/update', method: 'put', data })
}

// 删除印章
export function deleteSeal(id) {
  return request({ url: '/oa/seal/delete?id=' + id, method: 'delete' })
}
