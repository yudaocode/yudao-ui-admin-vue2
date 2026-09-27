import request from '@/utils/request'

export function createInsuranceScheme(data) {
  return request({ url: '/hrm/insurance/scheme/create', method: 'post', data })
}

export function updateInsuranceScheme(data) {
  return request({ url: '/hrm/insurance/scheme/update', method: 'put', data })
}

export function deleteInsuranceScheme(id) {
  return request({ url: '/hrm/insurance/scheme/delete?id=' + id, method: 'delete' })
}

export function getInsuranceScheme(id) {
  return request({ url: '/hrm/insurance/scheme/get?id=' + id, method: 'get' })
}

export function getInsuranceSchemeList() {
  return request({ url: '/hrm/insurance/scheme/list', method: 'get' })
}

export function getInsuranceSchemeSimpleList() {
  return request({ url: '/hrm/insurance/scheme/simple-list', method: 'get' })
}
