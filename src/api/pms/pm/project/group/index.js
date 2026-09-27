import request from '@/api/pms/request'
// 查询当前用户的项目分组列表
export const getProjectGroupList = () => {
    return request.get({ url: '/pms/pm/project-group/list' })
}
// 新增项目分组
export const createProjectGroup = (data) => {
    return request.post({ url: '/pms/pm/project-group/create', data })
}
// 修改项目分组
export const updateProjectGroup = (data) => {
    return request.put({ url: '/pms/pm/project-group/update', data })
}
// 修改项目分组排序
export const updateProjectGroupSort = (items) => {
    return request.put({ url: '/pms/pm/project-group/update-sort', data: { items } })
}
// 删除项目分组
export const deleteProjectGroup = (id) => {
    return request.delete({ url: '/pms/pm/project-group/delete', params: { id } })
}
// 移动项目到个人分组
export const moveProjectToGroup = (data) => {
    return request.put({ url: '/pms/pm/project-group/move-project', data })
}
