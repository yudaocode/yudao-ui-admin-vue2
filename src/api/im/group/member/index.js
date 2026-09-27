import request from '@/utils/request'

// 群成员 Response VO

// 邀请用户加入群
export const inviteGroupMember = data => {
  return request({
    url: '/im/group/invite',
    data,
    method: 'post' })
}

// 退出群
export const quitGroup = groupId => {
  return request({
    url: '/im/group/quit',
    params: {
      groupId
    },
    method: 'delete' })
}

// 移除群成员
export const removeGroupMember = data => {
  return request({
    url: '/im/group/kicking',
    data,
    method: 'delete' })
}

// 获得群成员详情
export const getGroupMember = (groupId, userId) => {
  return request({
    url: '/im/group-member/get',
    params: {
      groupId,
      userId
    },
    method: 'get' })
}

// 获得指定群的成员列表（聚合 AdminUser 昵称 / 头像）
export const getGroupMemberList = groupId => {
  return request({
    url: '/im/group-member/list',
    params: {
      groupId
    },
    method: 'get' })
}

// 更新群成员
export const updateGroupMember = data => {
  return request({
    url: '/im/group-member/update',
    data,
    method: 'put' })
}
