import request from '@/utils/request'

// 参与讨论投票
export function voteDiscussion(discussionId, optionIds) {
  return request({ url: '/oa/discussion-vote/create', method: 'post', data: { discussionId, optionIds } })
}
