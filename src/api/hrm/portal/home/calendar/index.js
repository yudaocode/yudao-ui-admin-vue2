import request from '@/utils/request'

export function getEmployeeHomeCalendar(params) {
  return request({ url: '/hrm/portal/home/calendar', method: 'get', params })
}
