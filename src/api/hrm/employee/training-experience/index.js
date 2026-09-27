import request from '@/utils/request'

export function getEmployeeTrainingExperienceList(employeeId) {
  return request({ url: '/hrm/employee/training-experience/list', method: 'get', params: { employeeId }})
}

export function createEmployeeTrainingExperience(data) {
  return request({ url: '/hrm/employee/training-experience/create', method: 'post', data })
}

export function updateEmployeeTrainingExperience(data) {
  return request({ url: '/hrm/employee/training-experience/update', method: 'put', data })
}

export function deleteEmployeeTrainingExperience(id) {
  return request({ url: '/hrm/employee/training-experience/delete', method: 'delete', params: { id }})
}
