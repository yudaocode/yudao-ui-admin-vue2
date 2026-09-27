import request from '@/utils/request'

export function createSalaryConfig(data) {
  return request({ url: '/hrm/salary/config/create', method: 'post', data })
}

export function updateSalaryConfig(data) {
  return request({ url: '/hrm/salary/config/update', method: 'put', data })
}

export function getSalaryConfig() {
  return request({ url: '/hrm/salary/config/get', method: 'get' })
}
