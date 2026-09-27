import request from '@/utils/request'

export function getEmployeeWorkExperienceList() {
  return request({ url: '/hrm/portal/employee/work-experience/list', method: 'get' })
}
