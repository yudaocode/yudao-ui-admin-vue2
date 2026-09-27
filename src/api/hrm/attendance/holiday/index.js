import request from '@/utils/request'

// 获得考勤节假日分页
export function getAttendanceHolidayPage(params) {
  return request({ url: '/hrm/attendance/holiday/page', method: 'get', params })
}

// 获得考勤节假日详情
export function getAttendanceHoliday(id) {
  return request({ url: '/hrm/attendance/holiday/get?id=' + id, method: 'get' })
}

// 创建考勤节假日
export function createAttendanceHoliday(data) {
  return request({ url: '/hrm/attendance/holiday/create', method: 'post', data })
}

// 修改考勤节假日
export function updateAttendanceHoliday(data) {
  return request({ url: '/hrm/attendance/holiday/update', method: 'put', data })
}

// 删除考勤节假日
export function deleteAttendanceHoliday(id) {
  return request({ url: '/hrm/attendance/holiday/delete?id=' + id, method: 'delete' })
}
