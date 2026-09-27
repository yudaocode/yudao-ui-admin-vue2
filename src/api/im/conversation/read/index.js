import request from '@/utils/request'

// IM 会话读位置 Response VO

// 增量拉取当前用户的会话读位置（重连 / 离线补偿）
export const pullMyConversationReadList = params => {
  return request({
    url: '/im/conversation-read/pull',
    params,
    method: 'get' })
}
