import request from '@/utils/request'

// 查询会员用户分页
export function getUserPage(params) {
  return request({ url: '/member/user/page', method: 'get', params: params })
}

// 查询会员用户详情
export function getUser(id) {
  return request({ url: '/member/user/get?id=' + id, method: 'get' })
}

// 修改会员用户
export function updateUser(data) {
  return request({ url: '/member/user/update', method: 'put', data: data })
}

// 修改会员用户等级
export function updateUserLevel(data) {
  return request({ url: '/member/user/update-level', method: 'put', data: data })
}

// 修改会员用户积分
export function updateUserPoint(data) {
  return request({ url: '/member/user/update-point', method: 'put', data: data })
}
