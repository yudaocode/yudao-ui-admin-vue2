import request from '@/api/pms/request'
// 查询知识库分页
export const getKnowledgeLibraryPage = (params) => {
    return request.get({ url: '/pms/kb/library/page', params })
}
// 查询知识库详情
export const getKnowledgeLibrary = (id) => {
    return request.get({ url: '/pms/kb/library/get', params: { id } })
}
// 查询知识库模板列表
export const getKnowledgeLibraryTemplateList = () => {
    return request.get({
        url: '/pms/kb/library-template/simple-list'
    })
}
// 新增知识库
export const createKnowledgeLibrary = (data) => {
    return request.post({ url: '/pms/kb/library/create', data })
}
// 修改知识库
export const updateKnowledgeLibrary = (data) => {
    return request.put({ url: '/pms/kb/library/update', data })
}
// 删除知识库
export const deleteKnowledgeLibrary = (id) => {
    return request.delete({ url: '/pms/kb/library/delete', params: { id } })
}
