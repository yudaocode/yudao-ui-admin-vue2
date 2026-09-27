import request from '@/utils/request'
// 获得当前登录用户的群列表
export const getMyGroupList = () => {
  return request({
    url: '/im/group/list',
    method: 'get' })
}

// 获得群详情
export const getGroup = id => {
  return request({
    url: '/im/group/get',
    params: {
      id
    },
    method: 'get' })
}

// 创建群
export const createGroup = data => {
  return request({
    url: '/im/group/create',
    data,
    method: 'post' })
}

// 更新群
export const updateGroup = data => {
  return request({
    url: '/im/group/update',
    data,
    method: 'put' })
}

// 解散群
export const dissolveGroup = id => {
  return request({
    url: '/im/group/dissolve',
    params: {
      id
    },
    method: 'delete' })
}

// 添加群管理员（仅群主可调）
export const addGroupAdmin = data => {
  return request({
    url: '/im/group/add-admin',
    data,
    method: 'put' })
}

// 撤销群管理员（仅群主可调）
export const removeGroupAdmin = data => {
  return request({
    url: '/im/group/remove-admin',
    data,
    method: 'put' })
}

// 转让群主（仅老群主可调；旧群主转让后降为普通成员）
export const transferGroupOwner = data => {
  return request({
    url: '/im/group/transfer-owner',
    data,
    method: 'put' })
}

// 置顶群消息（仅群主 / 管理员可调）
export const pinGroupMessage = data => {
  return request({
    url: '/im/group/pin-message',
    data,
    method: 'put' })
}

// 取消置顶群消息（仅群主 / 管理员可调）
export const unpinGroupMessage = data => {
  return request({
    url: '/im/group/unpin-message',
    data,
    method: 'put' })
}

// 全群禁言 / 取消（仅群主 / 管理员可调）
export const muteAll = data => {
  return request({
    url: '/im/group/mute-all',
    data,
    method: 'put' })
}

// 禁言成员
export const muteMember = data => {
  return request({
    url: '/im/group/mute-member',
    data,
    method: 'put' })
}

// 取消成员禁言
export const cancelMuteMember = data => {
  return request({
    url: '/im/group/cancel-mute-member',
    data,
    method: 'put' })
}
