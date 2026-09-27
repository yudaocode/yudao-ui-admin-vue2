import request from '@/utils/request'

// IM 好友申请 Response VO

// 发起好友申请
export const applyFriendRequest = data => {
  return request({
    url: '/im/friend-request/apply',
    data,
    method: 'post' })
}

// 同意好友申请
export const agreeFriendRequest = id => {
  return request({
    url: '/im/friend-request/agree',
    params: {
      id
    },
    method: 'put' })
}

// 拒绝好友申请
export const refuseFriendRequest = (id, handleContent) => {
  return request({
    url: '/im/friend-request/refuse',
    params: {
      id,
      handleContent
    },
    method: 'put' })
}

// 查询「我相关」的好友申请列表（游标分页：传 maxId 加载更多）
export const getMyFriendRequestList = (limit, maxId) => {
  const params = {
    limit
  }
  if (maxId != null) {
    params.maxId = maxId
  }
  return request({
    url: '/im/friend-request/list',
    params,
    method: 'get' })
}

// 增量拉取「我相关」的好友申请变更（重连 / 离线补偿）
export const pullMyFriendRequestList = params => {
  return request({
    url: '/im/friend-request/pull',
    params,
    method: 'get' })
}

// 按 id 单查「我相关」的申请记录（带越权过滤；WebSocket 通知到达后用）
export const getMyFriendRequest = id => {
  return request({
    url: '/im/friend-request/get',
    params: {
      id
    },
    method: 'get' })
}
