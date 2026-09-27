import request from '@/utils/request'

export function getEmployeeWorkExperienceList(employeeId) {
  return request({ url: '/hrm/employee/work-experience/list', method: 'get', params: { employeeId }})
}

export function createEmployeeWorkExperience(data) {
  return request({ url: '/hrm/employee/work-experience/create', method: 'post', data })
}

export function updateEmployeeWorkExperience(data) {
  return request({ url: '/hrm/employee/work-experience/update', method: 'put', data })
}

export function deleteEmployeeWorkExperience(id) {
  return request({ url: '/hrm/employee/work-experience/delete', method: 'delete', params: { id }})
}
