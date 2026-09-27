import request from '@/utils/request'

export function getInsuranceEmployeeInfo(employeeId) {
  return request({ url: '/hrm/insurance/employee-info/get', method: 'get', params: { employeeId }})
}

export function saveInsuranceEmployeeInfo(data) {
  return request({ url: '/hrm/insurance/employee-info/save', method: 'put', data })
}

export function updateEmployeeScheme(employeeId, schemeId) {
  return request({
    url: '/hrm/insurance/employee-info/update-scheme',
    method: 'put',
    data: { employeeId, schemeId }
  })
}
