import request from '@/utils/request'

// 查询社交客户端分页
export function getSocialClientPage(query) {
  return request({
    url: '/system/social-client/page',
    method: 'get',
    params: query
  })
}

// 查询社交客户端详情
export function getSocialClient(id) {
  return request({
    url: '/system/social-client/get?id=' + id,
    method: 'get'
  })
}

// 新增社交客户端
export function createSocialClient(data) {
  return request({
    url: '/system/social-client/create',
    method: 'post',
    data: data
  })
}

// 修改社交客户端
export function updateSocialClient(data) {
  return request({
    url: '/system/social-client/update',
    method: 'put',
    data: data
  })
}

// 删除社交客户端
export function deleteSocialClient(id) {
  return request({
    url: '/system/social-client/delete?id=' + id,
    method: 'delete'
  })
}
