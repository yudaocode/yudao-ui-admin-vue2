import request from '@/api/pms/request'
// 查询知识库模板分页
export const getKnowledgeLibraryTemplatePage = (params) => {
    return request.get({
        url: '/pms/kb/library-template/page',
        params
    })
}
// 查询知识库模板详情
export const getKnowledgeLibraryTemplate = (id) => {
    return request.get({
        url: '/pms/kb/library-template/get',
        params: { id }
    })
}
// 新增知识库模板
export const createKnowledgeLibraryTemplate = (data) => {
    return request.post({ url: '/pms/kb/library-template/create', data })
}
// 修改知识库模板
export const updateKnowledgeLibraryTemplate = (data) => {
    return request.put({ url: '/pms/kb/library-template/update', data })
}
// 删除知识库模板
export const deleteKnowledgeLibraryTemplate = (id) => {
    return request.delete({ url: '/pms/kb/library-template/delete', params: { id } })
}
