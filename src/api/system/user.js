import request from '@/utils/request'

// 查询用户列表
export function getUserPage(query) {
  return request({
    url: '/system/user/page',
    method: 'get',
    params: query
  })
}

// 获取用户精简信息列表
export function getSimpleUserList() {
  return request({
    url: '/system/user/simple-list',
    method: 'get'
  })
}

// 查询多个用户
export function getUserList(ids) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: { ids: ids.join(',') }
  })
}

// 按用户编号查询用户精简信息
export function getSimpleUser(id) {
  return request({
    url: '/system/user/get-simple',
    method: 'get',
    params: { id }
  })
}

// 按昵称模糊搜索用户（用于社交/IM 加好友等场景）
export function getSimpleUserListByNickname(nickname) {
  return request({
    url: '/system/user/list-by-nickname',
    method: 'get',
    params: { nickname }
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/system/user/get?id=' + userId,
    method: 'get'
  })
}

// 新增用户
export function createUser(data) {
  return request({
    url: '/system/user/create',
    method: 'post',
    data: data
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    url: '/system/user/update',
    method: 'put',
    data: data
  })
}

// 删除用户
export function deleteUser(userId) {
  return request({
    url: '/system/user/delete?id=' + userId,
    method: 'delete'
  })
}

// 批量删除用户
export function deleteUserList(ids) {
  return request({
    url: '/system/user/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

// 导出用户
export function exportUser(query) {
  return request({
    url: '/system/user/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// 用户密码重置
export function resetUserPassword(id, password) {
  const data = {
    id,
    password
  }
  return request({
    url: '/system/user/update-password',
    method: 'put',
    data: data
  })
}

// 用户状态修改
export function updateUserStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: '/system/user/update-status',
    method: 'put',
    data: data
  })
}

// 下载用户导入模板
export function importUserTemplate() {
  return request({
    url: '/system/user/get-import-template',
    method: 'get',
    responseType: 'blob'
  })
}
