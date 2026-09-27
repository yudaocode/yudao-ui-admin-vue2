import request from '@/api/pms/request'
// 点赞文档
export const createKnowledgeDocumentLike = (documentId) => {
    return request.post({ url: '/pms/kb/document-like/create', params: { documentId } })
}
// 取消点赞文档
export const deleteKnowledgeDocumentLike = (documentId) => {
    return request.delete({ url: '/pms/kb/document-like/delete', params: { documentId } })
}
