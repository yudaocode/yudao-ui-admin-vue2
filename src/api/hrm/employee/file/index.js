import request from '@/utils/request'

export function getEmployeeFileList(employeeId) {
  return request({ url: '/hrm/employee/file/list', method: 'get', params: { employeeId }})
}

export function saveEmployeeFiles(data) {
  return request({ url: '/hrm/employee/file/save', method: 'put', data })
}
