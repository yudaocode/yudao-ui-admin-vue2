import request from '@/utils/request'

// FMS 账套成员 API
export function getAccountUserList(accountSetId) {
  return request({ url: '/fms/config/account-user/list', method: 'get', params: { accountSetId } })
}

export function updateAccountUserList(data) {
  return request({ url: '/fms/config/account-user/update', method: 'put', data })
}

export function updateAccountSetDefaultStatus(accountSetId) {
  return request({ url: '/fms/config/account-user/update-default-status', method: 'put', params: { accountSetId } })
}

export const FmsAccountUserLevelEnum = Object.freeze({ OWNER: 1, READ: 2, WRITE: 3 })
