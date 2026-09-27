import request from '@/api/pms/request'
// 查询知识库目录树
export const getKnowledgeTree = (libraryId) => {
    return request.get({ url: '/pms/kb/folder/tree', params: { libraryId } })
}
// 查询知识库文件夹详情
export const getKnowledgeFolder = (id, view = false) => {
    return request.get({ url: '/pms/kb/folder/get', params: { id, view } })
}
// 新增知识库文件夹
export const createKnowledgeFolder = (data) => {
    return request.post({ url: '/pms/kb/folder/create', data })
}
// 修改知识库文件夹
export const updateKnowledgeFolder = (data) => {
    return request.put({ url: '/pms/kb/folder/update', data })
}
// 删除知识库文件夹
export const deleteKnowledgeFolder = (id) => {
    return request.delete({ url: '/pms/kb/folder/delete', params: { id } })
}
// 移动知识库文件夹
export const moveKnowledgeFolder = (data) => {
    return request.put({ url: '/pms/kb/folder/move', data })
}
