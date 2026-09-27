import request from '@/utils/request'

export function getEmployeeEducationExperienceList(employeeId) {
  return request({ url: '/hrm/employee/education-experience/list', method: 'get', params: { employeeId }})
}

export function createEmployeeEducationExperience(data) {
  return request({ url: '/hrm/employee/education-experience/create', method: 'post', data })
}

export function updateEmployeeEducationExperience(data) {
  return request({ url: '/hrm/employee/education-experience/update', method: 'put', data })
}

export function deleteEmployeeEducationExperience(id) {
  return request({ url: '/hrm/employee/education-experience/delete', method: 'delete', params: { id }})
}
