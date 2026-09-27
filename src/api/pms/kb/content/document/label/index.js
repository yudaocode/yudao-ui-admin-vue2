import request from '@/api/pms/request'
// 查询文档标签详情
export const getKnowledgeDocumentLabel = async (id) => {
    return await request.get({
        url: '/pms/kb/document-label/get',
        params: { id }
    })
}
// 查询文档标签列表
export const getKnowledgeDocumentLabelList = async () => {
    return await request.get({ url: '/pms/kb/document-label/list' })
}
// 新增文档标签
export const createKnowledgeDocumentLabel = async (data) => {
    return await request.post({ url: '/pms/kb/document-label/create', data })
}
// 修改文档标签
export const updateKnowledgeDocumentLabel = async (data) => {
    return await request.put({ url: '/pms/kb/document-label/update', data })
}
// 删除文档标签
export const deleteKnowledgeDocumentLabel = async (id) => {
    return await request.delete({ url: '/pms/kb/document-label/delete', params: { id } })
}
// 查询标签下的文档分页
export const getKnowledgeDocumentPageByLabel = async (params) => {
    return await request.get({
        url: '/pms/kb/document-label/document-page',
        params
    })
}
