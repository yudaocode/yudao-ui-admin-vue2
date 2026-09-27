import request from '@/api/pms/request'
// 查询工作项状态详情
export const getWorkItemStatus = (id) => {
    return request.get({
        url: '/pms/pm/work-item-status/get',
        params: { id }
    })
}
// 查询工作项状态列表
export const getWorkItemStatusList = (projectId, type) => {
    return request.get({
        url: '/pms/pm/work-item-status/list',
        params: { projectId, type }
    })
}
// 新增工作项状态
export const createWorkItemStatus = (data) => {
    return request.post({ url: '/pms/pm/work-item-status/create', data })
}
// 修改工作项状态配置
export const updateWorkItemStatusConfig = (data) => {
    return request.put({ url: '/pms/pm/work-item-status/update', data })
}
// 修改默认工作项状态
export const updateDefaultWorkItemStatus = (id) => {
    return request.put({ url: '/pms/pm/work-item-status/update-default', params: { id } })
}
// 修改工作项状态顺序
export const updateWorkItemStatusSort = (statusIds) => {
    return request.put({ url: '/pms/pm/work-item-status/update-sort', data: { statusIds } })
}
// 查询工作项看板配置
export const getWorkItemBoardConfig = (projectId, type) => {
    return request.get({
        url: '/pms/pm/work-item-status/get-board-config',
        params: { projectId, type }
    })
}
// 修改工作项看板配置
export const updateWorkItemBoardConfig = (projectId, workItemType, boards) => {
    return request.put({
        url: '/pms/pm/work-item-status/update-board-config',
        data: { projectId, workItemType, boards }
    })
}
// 删除工作项状态
export const deleteWorkItemStatus = (id, transferStatusId) => {
    return request.delete({
        url: '/pms/pm/work-item-status/delete',
        data: { id, transferStatusId }
    })
}
