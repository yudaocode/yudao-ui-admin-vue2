import request from '@/api/pms/request'
// 收藏项目
export const createProjectFavorite = (projectId) => {
    return request.post({ url: '/pms/pm/project-favorite/create', params: { projectId } })
}
// 取消收藏项目
export const deleteProjectFavorite = (projectId) => {
    return request.delete({ url: '/pms/pm/project-favorite/delete', params: { projectId } })
}
