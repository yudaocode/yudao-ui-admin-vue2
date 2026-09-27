import request from '@/api/pms/request'
// 查询项目模板分页
export const getProjectTemplatePage = (params) => {
    return request.get({
        url: '/pms/pm/project-template/page',
        params
    })
}
// 查询项目模板详情
export const getProjectTemplate = (id) => {
    return request.get({ url: '/pms/pm/project-template/get', params: { id } })
}
// 新增项目模板
export const createProjectTemplate = (data) => {
    return request.post({ url: '/pms/pm/project-template/create', data })
}
// 修改项目模板
export const updateProjectTemplate = (data) => {
    return request.put({ url: '/pms/pm/project-template/update', data })
}
// 删除项目模板
export const deleteProjectTemplate = (id) => {
    return request.delete({ url: '/pms/pm/project-template/delete', params: { id } })
}
