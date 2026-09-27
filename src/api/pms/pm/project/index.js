import request from '@/api/pms/request'
// 查询项目分页
export const getProjectPage = (params) => {
    return request.get({ url: '/pms/pm/project/page', params })
}
// 查询星标项目列表
export const getFavoriteProjectList = () => {
    return request.get({ url: '/pms/pm/project/favorite-list' })
}
// 查询项目详情
export const getProject = (id) => {
    return request.get({ url: '/pms/pm/project/get', params: { id } })
}
// 新增项目
export const createProject = (data) => {
    return request.post({ url: '/pms/pm/project/create', data })
}
// 修改项目
export const updateProject = (data) => {
    return request.put({ url: '/pms/pm/project/update', data })
}
// 归档项目
export const archiveProject = (id) => {
    return request.put({ url: '/pms/pm/project/archive', params: { id } })
}
// 将项目移入回收站
export const recycleProject = (id) => {
    return request.put({ url: '/pms/pm/project/recycle', params: { id } })
}
// 恢复回收站项目
export const restoreProject = (id) => {
    return request.put({ url: '/pms/pm/project/restore', params: { id } })
}
// 彻底删除回收站项目
export const deleteProject = (id) => {
    return request.delete({ url: '/pms/pm/project/delete', params: { id } })
}
// 查询项目概览
export const getProjectOverview = (projectId) => {
    return request.get({
        url: '/pms/pm/project/overview',
        params: { projectId }
    })
}
