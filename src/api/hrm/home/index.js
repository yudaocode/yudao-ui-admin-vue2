import request from '@/utils/request'

// 获得 HRM 首页统计汇总
export function getHrHomeStatisticsSummary() {
  return request({ url: '/hrm/home/hr-statistics-summary', method: 'get' })
}

// 获得 HR 工作台日历
export function getHrHomeCalendar(params) {
  return request({ url: '/hrm/home/hr-calendar', method: 'get', params })
}

// 获得 HRM 团队工作台统计汇总
export function getTeamHomeStatisticsSummary() {
  return request({ url: '/hrm/home/team-statistics-summary', method: 'get' })
}

// 获得 HRM 团队工作台日历
export function getTeamHomeCalendar(params) {
  return request({ url: '/hrm/home/team-calendar', method: 'get', params })
}
