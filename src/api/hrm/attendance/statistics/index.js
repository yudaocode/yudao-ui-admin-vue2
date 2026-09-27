import request from '@/utils/request'

// 获得月度考勤汇总分页
export function getAttendanceMonthRecordPage(params) {
  return request({ url: '/hrm/attendance/statistics/month-record-page', method: 'get', params })
}

// 获得月度打卡概况分页
export function getAttendanceMonthDailyOverviewPage(params) {
  return request({ url: '/hrm/attendance/statistics/month-daily-page', method: 'get', params })
}

// 获得月度考勤详情
export function getAttendanceMonthDetail(params) {
  return request({ url: '/hrm/attendance/statistics/month-detail', method: 'get', params })
}

// 获得每日考勤明细
export function getAttendanceDailyDetail(params) {
  return request({ url: '/hrm/attendance/statistics/daily-detail', method: 'get', params })
}

// 导出月度考勤汇总
export function exportAttendanceMonthRecord(params) {
  return request({
    url: '/hrm/attendance/statistics/month-record-export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导出月度打卡概况
export function exportAttendanceMonthDailyOverview(params) {
  return request({
    url: '/hrm/attendance/statistics/month-daily-export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
