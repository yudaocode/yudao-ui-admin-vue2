import request from '@/utils/request'

/** AI 知识库分段 API */
export const KnowledgeSegmentApi = {
  getKnowledgeSegmentPage(params) {
    return request({ url: '/ai/knowledge/segment/page', method: 'get', params })
  },
  getKnowledgeSegment(id) {
    return request({ url: '/ai/knowledge/segment/get?id=' + id, method: 'get' })
  },
  deleteKnowledgeSegment(id) {
    return request({ url: '/ai/knowledge/segment/delete?id=' + id, method: 'delete' })
  },
  createKnowledgeSegment(data) {
    return request({ url: '/ai/knowledge/segment/create', method: 'post', data })
  },
  updateKnowledgeSegment(data) {
    return request({ url: '/ai/knowledge/segment/update', method: 'put', data })
  },
  updateKnowledgeSegmentStatus(data) {
    return request({ url: '/ai/knowledge/segment/update-status', method: 'put', data })
  },
  splitContent(url, segmentMaxTokens) {
    return request({
      url: '/ai/knowledge/segment/split',
      method: 'get',
      params: { url, segmentMaxTokens }
    })
  },
  getKnowledgeSegmentProcessList(documentIds) {
    return request({
      url: '/ai/knowledge/segment/get-process-list',
      method: 'get',
      params: { documentIds: documentIds.join(',') }
    })
  },
  searchKnowledgeSegment(params) {
    return request({ url: '/ai/knowledge/segment/search', method: 'get', params })
  }
}
