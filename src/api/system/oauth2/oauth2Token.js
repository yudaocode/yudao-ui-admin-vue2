import request from '@/utils/request'

// 获得访问令牌分页
export function getAccessTokenPage(query) {
  return request({
    url: '/system/oauth2-token/page',
    method: 'get',
    params: query
  })
}

// 删除访问令牌
export function deleteAccessToken(accessToken) {
  return request({
    url: '/system/oauth2-token/delete?accessToken=' + accessToken,
    method: 'delete'
  })
}

// 创建apiKey令牌
export function createApiKeyToken() {
  return request({
    url: '/system/oauth2-token/create-api-key',
    method: 'post'
  })
}

// 获取apiKey令牌分页
export function getApiKeyTokenPage(query) {
  return request({
    url: '/system/oauth2-token/api-key/page',
    method: 'get',
    params: query
  })
}
