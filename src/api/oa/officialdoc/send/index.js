import request from '@/utils/request'

// 查询公文发文分页
export function getSendPage(params) {
  return request({ url: '/oa/officialdoc-send/page', method: 'get', params })
}

// 查询公文发文
export function getSend(id) {
  return request({ url: '/oa/officialdoc-send/get?id=' + id, method: 'get' })
}

// 新增公文发文
export function createSend(data) {
  return request({ url: '/oa/officialdoc-send/create', method: 'post', data })
}

// 修改公文发文
export function updateSend(data) {
  return request({ url: '/oa/officialdoc-send/update', method: 'put', data })
}

// 删除公文发文
export function deleteSend(id) {
  return request({ url: '/oa/officialdoc-send/delete?id=' + id, method: 'delete' })
}

// 提交公文发文
export function submitSend(id) {
  return request({ url: '/oa/officialdoc-send/submit?id=' + id, method: 'post' })
}

// 撤销公文发文
export function cancelSend(id) {
  return request({ url: '/oa/officialdoc-send/cancel?id=' + id, method: 'put' })
}
