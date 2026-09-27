import request from '@/utils/request'

// 查询考勤记录分页
export function getAttendancePage(params) {
  return request({ url: '/oa/attendance/page', method: 'get', params })
}

// 查询我的考勤记录分页
export function getMyAttendancePage(params) {
  return request({ url: '/oa/attendance/my-page', method: 'get', params })
}

// 查询考勤记录详情
export function getAttendance(id) {
  return request({ url: '/oa/attendance/get?id=' + id, method: 'get' })
}

// 查询我的今日考勤记录
export function getMyTodayAttendanceList() {
  return request({ url: '/oa/attendance/my-today-list', method: 'get' })
}

// 执行当前用户打卡
export function clockAttendance() {
  return request({ url: '/oa/attendance/clock', method: 'post' })
}

// 修改考勤记录
export function updateAttendance(data) {
  return request({ url: '/oa/attendance/update', method: 'put', data })
}

// 删除考勤记录
export function deleteAttendance(id) {
  return request({ url: '/oa/attendance/delete?id=' + id, method: 'delete' })
}

// 查询考勤周报
export function getAttendanceWeekReport(params) {
  return request({ url: '/oa/attendance/week-report', method: 'get', params })
}

// 查询考勤月报
export function getAttendanceMonthReport(params) {
  return request({ url: '/oa/attendance/month-report', method: 'get', params })
}
