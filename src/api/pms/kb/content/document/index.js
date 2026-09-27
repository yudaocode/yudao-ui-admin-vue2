import request from '@/api/pms/request'
// 查询知识库文档详情
export const getKnowledgeDocument = (id, view = false) => {
    return request.get({
        url: '/pms/kb/document/get',
        params: { id, view }
    })
}
// 新增知识库文档
export const createKnowledgeDocument = (data) => {
    return request.post({ url: '/pms/kb/document/create', data })
}
// 修改知识库文档
export const updateKnowledgeDocument = (data) => {
    return request.put({ url: '/pms/kb/document/update', data })
}
// 删除知识库文档
export const deleteKnowledgeDocument = (id) => {
    return request.delete({ url: '/pms/kb/document/delete', params: { id } })
}
// 移动知识库文档
export const moveKnowledgeDocument = (data) => {
    return request.put({ url: '/pms/kb/document/move', data })
}
// 查询知识库文档搜索分页
export const getKnowledgeDocumentSearchPage = (params) => {
    return request.get({
        url: '/pms/kb/document/search-page',
        params
    })
}
