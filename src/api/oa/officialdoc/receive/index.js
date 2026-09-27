import request from '@/utils/request'

// 查询公文收文分页
export function getReceivePage(params) {
  return request({ url: '/oa/officialdoc-receive/page', method: 'get', params })
}

// 查询公文收文
export function getReceive(id) {
  return request({ url: '/oa/officialdoc-receive/get?id=' + id, method: 'get' })
}

// 新增公文收文
export function createReceive(data) {
  return request({ url: '/oa/officialdoc-receive/create', method: 'post', data })
}

// 修改公文收文
export function updateReceive(data) {
  return request({ url: '/oa/officialdoc-receive/update', method: 'put', data })
}

// 删除公文收文
export function deleteReceive(id) {
  return request({ url: '/oa/officialdoc-receive/delete?id=' + id, method: 'delete' })
}

// 提交公文收文
export function submitReceive(id) {
  return request({ url: '/oa/officialdoc-receive/submit?id=' + id, method: 'post' })
}

// 撤销公文收文
export function cancelReceive(id) {
  return request({ url: '/oa/officialdoc-receive/cancel?id=' + id, method: 'put' })
}

// 签收公文收文
export function claimReceive(id) {
  return request({ url: '/oa/officialdoc-receive/claim?id=' + id, method: 'put' })
}
