import request from '@/utils/request'

export function getAttendanceRecordList(year, month) {
  return request({ url: '/hrm/portal/attendance/clock/list', method: 'get', params: { year, month }})
}
