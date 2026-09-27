import request from '@/api/pms/request'
// 查询项目成员列表
export const getProjectMemberList = (projectId) => {
    return request.get({
        url: '/pms/pm/project-member/list',
        params: { projectId }
    })
}
// 修改项目成员列表
export const updateProjectMemberList = (projectId, members) => {
    return request.put({
        url: '/pms/pm/project-member/update-list',
        data: { projectId, members }
    })
}
// 删除项目成员
export const deleteProjectMember = (projectId, userId) => {
    return request.delete({
        url: '/pms/pm/project-member/delete',
        params: { projectId, userId }
    })
}
// 退出项目
export const exitProject = (projectId) => {
    return request.delete({ url: '/pms/pm/project-member/exit', params: { projectId } })
}
