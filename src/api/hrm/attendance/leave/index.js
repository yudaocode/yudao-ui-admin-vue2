import request from '@/utils/request'

// 获得请假分页
export function getAttendanceLeavePage(params) {
  return request({ url: '/hrm/attendance/leave/page', method: 'get', params })
}

// 导出请假
export function exportAttendanceLeave(params) {
  return request({
    url: '/hrm/attendance/leave/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获得请假详情
export function getAttendanceLeave(id) {
  return request({ url: '/hrm/attendance/leave/get?id=' + id, method: 'get' })
}
