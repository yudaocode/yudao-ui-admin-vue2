import request from '@/api/pms/request'
// 查询文档分享信息
export const getKnowledgeDocumentShare = (documentId) => {
    return request.get({
        url: '/pms/kb/document-share/get',
        params: { documentId }
    })
}
// 开启文档分享
export const openKnowledgeDocumentShare = (data) => {
    return request.post({ url: '/pms/kb/document-share/open', data })
}
// 修改文档分享成员列表
export const updateKnowledgeDocumentShareMemberList = (data) => {
    return request.put({ url: '/pms/kb/document-share/update-member-list', data })
}
// 关闭文档分享
export const closeKnowledgeDocumentShare = (documentId) => {
    return request.put({ url: '/pms/kb/document-share/close', params: { documentId } })
}
// 查询公开分享的文档内容
export const getPublicKnowledgeDocument = (token) => {
    return request.get({
        url: '/pms/kb/document-share/get-by-token',
        params: { token },
        headers: { isToken: false }
    })
}
