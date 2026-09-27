import request from '@/utils/request'

// 查询讨论回复分页
export function getDiscussionReplyPage(params) {
  return request({ url: '/oa/discussion-reply/page', method: 'get', params })
}

// 新增讨论回复
export function createDiscussionReply(data) {
  return request({ url: '/oa/discussion-reply/create', method: 'post', data })
}

// 删除讨论回复
export function deleteDiscussionReply(id) {
  return request({ url: '/oa/discussion-reply/delete?id=' + id, method: 'delete' })
}
