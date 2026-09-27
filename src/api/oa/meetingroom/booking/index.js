import request from '@/utils/request'

// 查询会议室预定分页
export function getMeetingRoomBookingPage(params) {
  return request({ url: '/oa/meeting-room-booking/page', method: 'get', params })
}

// 查询会议室预定详情
export function getMeetingRoomBooking(id) {
  return request({ url: '/oa/meeting-room-booking/get?id=' + id, method: 'get' })
}

// 新增会议室预定
export function createMeetingRoomBooking(data) {
  return request({ url: '/oa/meeting-room-booking/create', method: 'post', data })
}

// 修改会议室预定
export function updateMeetingRoomBooking(data) {
  return request({ url: '/oa/meeting-room-booking/update', method: 'put', data })
}

// 删除会议室预定
export function deleteMeetingRoomBooking(id) {
  return request({ url: '/oa/meeting-room-booking/delete?id=' + id, method: 'delete' })
}

// 提交会议室预定
export function submitMeetingRoomBooking(id) {
  return request({ url: '/oa/meeting-room-booking/submit?id=' + id, method: 'put' })
}

// 取消会议室预定
export function cancelMeetingRoomBooking(id) {
  return request({ url: '/oa/meeting-room-booking/cancel?id=' + id, method: 'put' })
}

// 开始使用会议室预定
export function startMeetingRoomBooking(id) {
  return request({ url: '/oa/meeting-room-booking/start?id=' + id, method: 'put' })
}

// 完成使用会议室预定
export function finishMeetingRoomBooking(id) {
  return request({ url: '/oa/meeting-room-booking/finish?id=' + id, method: 'put' })
}

// 查询会议室日程
export function getMeetingRoomBookingSchedule(roomId, startTime, endTime) {
  return request({
    url: '/oa/meeting-room-booking/schedule',
    method: 'get',
    params: { roomId: roomId, startTime: startTime, endTime: endTime }
  })
}
