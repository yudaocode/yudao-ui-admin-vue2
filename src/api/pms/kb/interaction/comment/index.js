import request from '@/api/pms/request'
// 查询文档评论列表
export const getKnowledgeDocumentCommentList = (documentId) => {
    return request.get({
        url: '/pms/kb/document-comment/list',
        params: { documentId }
    })
}
// 新增文档评论
export const createKnowledgeDocumentComment = (data) => {
    return request.post({ url: '/pms/kb/document-comment/create', data })
}
// 删除文档评论
export const deleteKnowledgeDocumentComment = (id) => {
    return request.delete({ url: '/pms/kb/document-comment/delete', params: { id } })
}
