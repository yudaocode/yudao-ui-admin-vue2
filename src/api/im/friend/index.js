import request from '@/utils/request'

// IM 好友 Response VO

// 获得当前登录用户的好友列表
export const getMyFriendList = () => {
  return request({
    url: '/im/friend/list',
    method: 'get' })
}

// 增量拉取当前用户的好友关系（重连 / 离线补偿）
export const pullMyFriendList = params => {
  return request({
    url: '/im/friend/pull',
    params,
    method: 'get' })
}

// 获得好友详情
export const getFriend = friendUserId => {
  return request({
    url: '/im/friend/get',
    params: {
      friendUserId
    },
    method: 'get' })
}

// 删除好友（单向软删除）
export const deleteFriend = (friendUserId, clear) => {
  return request({
    url: '/im/friend/delete',
    params: {
      friendUserId,
      clear
    },
    method: 'delete' })
}

// 更新好友信息（备注 / 免打扰 / 联系人置顶）
export const updateFriend = data => {
  return request({
    url: '/im/friend/update',
    data,
    method: 'put' })
}

// 拉黑好友（必须先是好友；单边屏蔽对方私聊消息）
export const blockFriend = friendUserId => {
  return request({
    url: '/im/friend/block',
    params: {
      friendUserId
    },
    method: 'put' })
}

// 移出黑名单
export const unblockFriend = friendUserId => {
  return request({
    url: '/im/friend/unblock',
    params: {
      friendUserId
    },
    method: 'put' })
}
