import request from '@/utils/request'

// AI API 密钥 API
export const ApiKeyApi = {
  // 查询 API 密钥分页
  getApiKeyPage(params) {
    return request({ url: '/ai/api-key/page', method: 'get', params })
  },

  // 获得 API 密钥列表
  getApiKeySimpleList() {
    return request({ url: '/ai/api-key/simple-list', method: 'get' })
  },

  // 查询 API 密钥详情
  getApiKey(id) {
    return request({ url: '/ai/api-key/get?id=' + id, method: 'get' })
  },

  // 新增 API 密钥
  createApiKey(data) {
    return request({ url: '/ai/api-key/create', method: 'post', data })
  },

  // 修改 API 密钥
  updateApiKey(data) {
    return request({ url: '/ai/api-key/update', method: 'put', data })
  },

  // 删除 API 密钥
  deleteApiKey(id) {
    return request({ url: '/ai/api-key/delete?id=' + id, method: 'delete' })
  }
}
