import request from '@/utils/request'

// FMS 账套 API
export function getAccountSetList() {
  return request({ url: '/fms/config/account-set/list', method: 'get' })
}

export function getAccountSet(id) {
  return request({ url: '/fms/config/account-set/get?id=' + id, method: 'get' })
}

export function createAccountSet(data) {
  return request({ url: '/fms/config/account-set/create', method: 'post', data })
}

export function updateAccountSet(data) {
  return request({ url: '/fms/config/account-set/update', method: 'put', data })
}

export function initializeAccountSet(data) {
  return request({ url: '/fms/config/account-set/initialize', method: 'put', data })
}
