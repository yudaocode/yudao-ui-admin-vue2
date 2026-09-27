import request from '@/utils/request'

// 新增讨论点赞
export function createDiscussionLike(discussionId, replyId) {
  return request({ url: '/oa/discussion-like/create', method: 'post', data: { discussionId, replyId } })
}

// 删除讨论点赞
export function deleteDiscussionLike(discussionId, replyId) {
  return request({ url: '/oa/discussion-like/delete', method: 'delete', params: { discussionId, replyId } })
}
