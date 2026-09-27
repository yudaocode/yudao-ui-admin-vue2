import request from '@/utils/request'

// 创建新通话请求 VO

// 创建新通话；私聊或群聊根据 conversationType 区分
export const createCall = data => {
  return request({
    url: '/im/rtc/create',
    data,
    method: 'post' })
}

// 通话中追加邀请；仅群通话可用
export const inviteCall = data => {
  return request({
    url: '/im/rtc/invite',
    data,
    method: 'post' })
}

// 加入已有群通话；用于胶囊条「加入」按钮
export const joinCall = room => {
  return request({
    url: '/im/rtc/join',
    params: {
      room
    },
    method: 'post' })
}

// 接听通话
export const acceptCall = room => {
  return request({
    url: '/im/rtc/accept',
    params: {
      room
    },
    method: 'post' })
}

// 拒绝通话
export const rejectCall = room => {
  return request({
    url: '/im/rtc/reject',
    params: {
      room
    },
    method: 'post' })
}

// 取消邀请；主叫接通前调用
export const cancelCall = room => {
  return request({
    url: '/im/rtc/cancel',
    params: {
      room
    },
    method: 'post' })
}

// 离开通话；接通后调用
export const leaveCall = room => {
  return request({
    url: '/im/rtc/leave',
    params: {
      room
    },
    method: 'post' })
}

// 振铃超时检查；RUNNING 端 timer 兜底，触发后端立即扫描该 room 的超时 INVITING（接口静默）
export const noAnswerCallCheck = room => {
  return request({
    url: '/im/rtc/no-answer-call-check',
    params: {
      room
    },
    method: 'post' })
}

// 查询当前进行中的通话；目前仅群聊场景（胶囊条），返回 null 表示无活跃通话
export const getActiveCall = groupId => {
  return request({
    url: '/im/rtc/get-active-call',
    params: {
      groupId
    },
    method: 'get' })
}
