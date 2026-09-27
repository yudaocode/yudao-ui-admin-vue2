import request from '@/utils/request'
// 拉取当前用户应收的频道消息（离线增量）；按 minId 游标分页
export const pullChannelMessageList = (params, signal) => {
  return request({
    url: '/im/channel/message/pull',
    params,
    signal,
    method: 'get' })
}

// 上报频道消息已读位置；切到频道会话或拉到新消息后调
export const readChannelMessages = (channelId, messageId) => {
  return request({
    url: '/im/channel/message/read',
    params: {
      channelId,
      messageId
    },
    method: 'put' })
}
