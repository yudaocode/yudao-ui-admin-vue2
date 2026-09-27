import request from '@/utils/request'

// 私聊消息 Response VO

// 发送私聊消息
export const sendPrivateMessage = data => {
  return request({
    url: '/im/message/private/send',
    data,
    method: 'post' })
}

// 拉取私聊消息（增量）
export const pullPrivateMessageList = (params, signal) => {
  return request({
    url: '/im/message/private/pull',
    params,
    signal,
    method: 'get' })
}

// 查询私聊历史消息
export const getPrivateMessageList = params => {
  return request({
    url: '/im/message/private/list',
    params,
    method: 'get' })
}

// 标记私聊消息已读
export const readPrivateMessages = (receiverId, messageId) => {
  return request({
    url: '/im/message/private/read',
    params: {
      receiverId,
      messageId
    },
    method: 'put' })
}

// 查询对方已读到我发的最大消息 id（多端 / 离线后用于补齐已读状态）
export const getPrivateMaxReadMessageId = (peerId, signal) => {
  return request({
    url: '/im/message/private/max-read-message-id',
    params: {
      peerId
    },
    signal,
    method: 'get' })
}

// 撤回私聊消息
export const recallPrivateMessage = id => {
  return request({
    url: '/im/message/private/recall',
    params: {
      id
    },
    method: 'delete' })
}
