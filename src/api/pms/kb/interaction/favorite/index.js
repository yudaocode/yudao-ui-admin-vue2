import request from '@/api/pms/request'
// 关注知识对象
export const createKnowledgeFavorite = (data) => {
    return request.post({ url: '/pms/kb/favorite/create', data })
}
// 取消关注知识对象
export const deleteKnowledgeFavorite = (type, entityId) => {
    return request.delete({ url: '/pms/kb/favorite/delete', params: { type, entityId } })
}
// 查询关注列表分页
export const getKnowledgeFavoritePage = (params) => {
    return request.get({
        url: '/pms/kb/favorite/page',
        params
    })
}
// 查询指定知识库内的关注内容
export const getKnowledgeFavoriteList = (libraryId) => {
    return request.get({
        url: '/pms/kb/favorite/list',
        params: { libraryId }
    })
}
