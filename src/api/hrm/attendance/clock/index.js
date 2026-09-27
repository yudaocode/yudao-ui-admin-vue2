import request from '@/utils/request'

// 获得考勤打卡分页
export function getAttendanceClockPage(params) {
  return request({ url: '/hrm/attendance/clock/page', method: 'get', params })
}

// 获得考勤打卡详情
export function getAttendanceClock(id) {
  return request({ url: '/hrm/attendance/clock/get?id=' + id, method: 'get' })
}

// 获得员工实际班次和允许打卡时间
export function getAttendanceClockShift(params) {
  return request({ url: '/hrm/attendance/clock/get-shift', method: 'get', params })
}

// 导出考勤打卡
export function exportAttendanceClock(params) {
  return request({
    url: '/hrm/attendance/clock/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 新增考勤打卡
export function createAttendanceClock(data) {
  return request({ url: '/hrm/attendance/clock/create', method: 'post', data })
}

// 修改考勤打卡
export function updateAttendanceClock(data) {
  return request({ url: '/hrm/attendance/clock/update', method: 'put', data })
}

// 删除考勤打卡
export function deleteAttendanceClock(id) {
  return request({ url: '/hrm/attendance/clock/delete?id=' + id, method: 'delete' })
}

// 批量删除考勤打卡
export function deleteAttendanceClockList(ids) {
  return request({
    url: '/hrm/attendance/clock/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}
