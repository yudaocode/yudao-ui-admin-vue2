import request from '@/utils/request'

// AI 模型 API
export const ModelApi = {
  // 查询模型分页
  getModelPage(params) {
    return request({ url: '/ai/model/page', method: 'get', params })
  },

  // 获得模型列表
  getModelSimpleList(type) {
    return request({ url: '/ai/model/simple-list', method: 'get', params: { type }})
  },

  // 查询模型详情
  getModel(id) {
    return request({ url: '/ai/model/get?id=' + id, method: 'get' })
  },

  // 新增模型
  createModel(data) {
    return request({ url: '/ai/model/create', method: 'post', data })
  },

  // 修改模型
  updateModel(data) {
    return request({ url: '/ai/model/update', method: 'put', data })
  },

  // 删除模型
  deleteModel(id) {
    return request({ url: '/ai/model/delete?id=' + id, method: 'delete' })
  }
}
