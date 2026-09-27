import request from '@/utils/request'

/** AI 知识库文档 API */
export const KnowledgeDocumentApi = {
  getKnowledgeDocumentPage(params) {
    return request({ url: '/ai/knowledge/document/page', method: 'get', params })
  },
  getKnowledgeDocument(id) {
    return request({ url: '/ai/knowledge/document/get?id=' + id, method: 'get' })
  },
  createKnowledgeDocument(data) {
    return request({ url: '/ai/knowledge/document/create', method: 'post', data })
  },
  createKnowledgeDocumentList(data) {
    return request({ url: '/ai/knowledge/document/create-list', method: 'post', data })
  },
  updateKnowledgeDocument(data) {
    return request({ url: '/ai/knowledge/document/update', method: 'put', data })
  },
  updateKnowledgeDocumentStatus(data) {
    return request({ url: '/ai/knowledge/document/update-status', method: 'put', data })
  },
  deleteKnowledgeDocument(id) {
    return request({ url: '/ai/knowledge/document/delete?id=' + id, method: 'delete' })
  }
}
