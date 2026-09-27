import request from '@/utils/request'

// 查询当前登录用户的个人资料
export function getUserProfile() {
  return request({ url: '/system/user/profile/get', method: 'get' })
}

// 修改当前登录用户的个人资料
export function updateUserProfile(data) {
  return request({ url: '/system/user/profile/update', method: 'put', data })
}

// 修改当前登录用户密码
export function updateUserPassword(oldPassword, newPassword) {
  return request({
    url: '/system/user/profile/update-password',
    method: 'put',
    data: { oldPassword, newPassword }
  })
}
