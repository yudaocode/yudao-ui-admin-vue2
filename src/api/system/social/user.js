import request from '@/utils/request'

// 查询社交用户分页
export function getSocialUserPage(query) {
  return request({
    url: '/system/social-user/page',
    method: 'get',
    params: query
  })
}

// 查询社交用户详情
export function getSocialUser(id) {
  return request({
    url: '/system/social-user/get?id=' + id,
    method: 'get'
  })
}

// 获得当前用户绑定的社交用户列表
export function getBindSocialUserList() {
  return request({
    url: '/system/social-user/get-bind-list',
    method: 'get'
  })
}
