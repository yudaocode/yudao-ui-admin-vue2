import request from '@/utils/request'

export function getMyAttendanceLeaveList() {
  return request({ url: '/hrm/portal/attendance/leave/list', method: 'get' })
}

export function createMyAttendanceLeave(data) {
  return request({ url: '/hrm/portal/attendance/leave/create', method: 'post', data })
}

export function cancelMyAttendanceLeave(id, reason) {
  return request({ url: '/hrm/portal/attendance/leave/cancel', method: 'put', data: { id, reason }})
}
