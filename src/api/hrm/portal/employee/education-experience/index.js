import request from '@/utils/request'

export function getEmployeeEducationExperienceList() {
  return request({ url: '/hrm/portal/employee/education-experience/list', method: 'get' })
}
