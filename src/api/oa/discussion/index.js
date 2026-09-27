import request from '@/utils/request'

// 查询讨论分页
export function getDiscussionPage(params) {
  return request({ url: '/oa/discussion/page', method: 'get', params })
}

// 查询讨论管理分页
export function getDiscussionManagePage(params) {
  return request({ url: '/oa/discussion/manage-page', method: 'get', params })
}

// 查询讨论详情
export function getDiscussion(id, visit = false) {
  return request({ url: '/oa/discussion/get?id=' + id + '&visit=' + visit, method: 'get' })
}

// 新增讨论
export function createDiscussion(data) {
  return request({ url: '/oa/discussion/create', method: 'post', data })
}

// 修改讨论
export function updateDiscussion(data) {
  return request({ url: '/oa/discussion/update', method: 'put', data })
}

// 删除讨论
export function deleteDiscussion(id) {
  return request({ url: '/oa/discussion/delete?id=' + id, method: 'delete' })
}
