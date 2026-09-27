import request from '@/api/pms/request'
// 查询当前用户的知识库分组列表
export const getKnowledgeGroupList = () => {
    return request.get({ url: '/pms/kb/group/list' })
}
// 查询知识库分组详情
export const getKnowledgeGroup = (id) => {
    return request.get({ url: '/pms/kb/group/get', params: { id } })
}
// 新增知识库分组
export const createKnowledgeGroup = (data) => {
    return request.post({ url: '/pms/kb/group/create', data })
}
// 修改知识库分组
export const updateKnowledgeGroup = (data) => {
    return request.put({ url: '/pms/kb/group/update', data })
}
// 修改知识库分组排序
export const updateKnowledgeGroupSort = (items) => {
    return request.put({ url: '/pms/kb/group/update-sort', data: { items } })
}
// 删除知识库分组
export const deleteKnowledgeGroup = (id) => {
    return request.delete({ url: '/pms/kb/group/delete', params: { id } })
}
// 移动知识库到个人分组
export const moveKnowledgeLibraryToGroup = (libraryId, groupId) => {
    return request.put({ url: '/pms/kb/group/move', data: { libraryId, groupId } })
}
