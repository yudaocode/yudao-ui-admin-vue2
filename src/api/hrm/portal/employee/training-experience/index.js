import request from '@/utils/request'

export function getEmployeeTrainingExperienceList() {
  return request({ url: '/hrm/portal/employee/training-experience/list', method: 'get' })
}
