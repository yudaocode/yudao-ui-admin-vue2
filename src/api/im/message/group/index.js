import request from '@/utils/request'

// 群聊消息 Response VO

// 发送群聊消息
export const sendGroupMessage = data => {
  return request({
    url: '/im/message/group/send',
    data,
    method: 'post' })
}

// 拉取群聊消息（增量）
export const pullGroupMessageList = (params, signal) => {
  return request({
    url: '/im/message/group/pull',
    params,
    signal,
    method: 'get' })
}

// 查询群聊历史消息
export const getGroupMessageList = params => {
  return request({
    url: '/im/message/group/list',
    params,
    method: 'get' })
}

// 标记群聊消息已读
export const readGroupMessages = (groupId, messageId) => {
  return request({
    url: '/im/message/group/read',
    params: {
      groupId,
      messageId
    },
    method: 'put' })
}

// 撤回群聊消息
export const recallGroupMessage = id => {
  return request({
    url: '/im/message/group/recall',
    params: {
      id
    },
    method: 'delete' })
}

// 获取群消息已读用户列表
export const getGroupReadUsers = params => {
  return request({
    url: '/im/message/group/get-read-user-ids',
    params,
    method: 'get' })
}
