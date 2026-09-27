import request from '@/utils/request'

// 查询会议室分页
export function getMeetingRoomPage(params) {
  return request({ url: '/oa/meeting-room/page', method: 'get', params })
}

// 查询会议室详情
export function getMeetingRoom(id) {
  return request({ url: '/oa/meeting-room/get?id=' + id, method: 'get' })
}

// 新增会议室
export function createMeetingRoom(data) {
  return request({ url: '/oa/meeting-room/create', method: 'post', data })
}

// 修改会议室
export function updateMeetingRoom(data) {
  return request({ url: '/oa/meeting-room/update', method: 'put', data })
}

// 删除会议室
export function deleteMeetingRoom(id) {
  return request({ url: '/oa/meeting-room/delete?id=' + id, method: 'delete' })
}

// 查询可预定的会议室分页
export function getBookableMeetingRoomPage(params) {
  return request({ url: '/oa/meeting-room/bookable-page', method: 'get', params })
}
