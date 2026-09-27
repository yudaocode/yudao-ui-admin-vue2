import request from '@/utils/request'

export function getAttendanceMonthDetail(year, month) {
  return request({
    url: '/hrm/portal/attendance/statistics/month-detail',
    method: 'get',
    params: { year, month }
  })
}

export function exportAttendanceMonthDetail(year, month) {
  return request({
    url: '/hrm/portal/attendance/statistics/export-excel',
    method: 'get',
    params: { year, month },
    responseType: 'blob'
  })
}
