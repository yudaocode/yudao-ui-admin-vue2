import request from '@/api/pms/request'
// 查询知识库回收站列表
export const getKnowledgeLibraryRecycleList = () => {
    return request.get({ url: '/pms/kb/recycle/library-list' })
}
// 查询知识库内容回收站列表
export const getKnowledgeContentRecycleList = (libraryId) => {
    return request.get({
        url: '/pms/kb/recycle/content-list',
        params: { libraryId }
    })
}
// 查询知识库回收站对象详情及级联内容
export const getKnowledgeContentRecycleDetail = (id) => {
    return request.get({
        url: '/pms/kb/recycle/content-detail',
        params: { id }
    })
}
// 预览知识库回收站内容
export const getKnowledgeContentRecyclePreview = (id, entityId) => {
    return request.get({
        url: '/pms/kb/recycle/content-preview',
        params: { id, entityId }
    })
}
// 恢复回收站记录
export const restoreKnowledgeRecycle = (id) => {
    return request.put({ url: '/pms/kb/recycle/restore', params: { id } })
}
// 彻底删除回收站记录
export const permanentDeleteKnowledgeRecycle = (id) => {
    return request.delete({ url: '/pms/kb/recycle/permanent-delete', params: { id } })
}
