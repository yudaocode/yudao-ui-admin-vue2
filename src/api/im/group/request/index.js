import request from '@/utils/request'

// IM 加群申请 Response VO

// 申请加群
export const applyJoinGroup = data => {
  return request({
    url: '/im/group-request/apply',
    data,
    method: 'post' })
}

// 同意加群申请（群主或管理员）
export const agreeGroupRequest = id => {
  return request({
    url: '/im/group-request/agree',
    params: {
      id
    },
    method: 'put' })
}

// 拒绝加群申请（群主或管理员）
export const refuseGroupRequest = (id, handleContent) => {
  return request({
    url: '/im/group-request/refuse',
    params: {
      id,
      handleContent
    },
    method: 'put' })
}

// 查询「我管理的所有群」下的未处理加群申请列表（不分页）；前端 store 据此派生横幅红点 + Drawer 列表
export const getUnhandledRequestList = () => {
  return request({
    url: '/im/group-request/unhandled-list',
    method: 'get' })
}

// 查询指定群下的全部加群申请（含已处理）；仅群主 / 管理员可查
export const getGroupRequestListByGroupId = groupId => {
  return request({
    url: '/im/group-request/list-by-group',
    params: {
      groupId
    },
    method: 'get' })
}

// 按 id 单查申请记录（带越权过滤；WebSocket 通知到达后用）
export const getMyGroupRequest = id => {
  return request({
    url: '/im/group-request/get',
    params: {
      id
    },
    method: 'get' })
}

// 增量拉取我管理的所有群下加群申请变更（重连 / 离线补偿）
export const pullMyGroupRequestList = params => {
  return request({
    url: '/im/group-request/pull',
    params,
    method: 'get' })
}
