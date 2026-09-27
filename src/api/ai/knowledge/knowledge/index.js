import request from '@/utils/request'

/** AI 知识库 API */
export const KnowledgeApi = {
  getKnowledgePage(params) {
    return request({ url: '/ai/knowledge/page', method: 'get', params })
  },
  getKnowledge(id) {
    return request({ url: '/ai/knowledge/get?id=' + id, method: 'get' })
  },
  createKnowledge(data) {
    return request({ url: '/ai/knowledge/create', method: 'post', data })
  },
  updateKnowledge(data) {
    return request({ url: '/ai/knowledge/update', method: 'put', data })
  },
  deleteKnowledge(id) {
    return request({ url: '/ai/knowledge/delete?id=' + id, method: 'delete' })
  },
  getSimpleKnowledgeList() {
    return request({ url: '/ai/knowledge/simple-list', method: 'get' })
  }
}
