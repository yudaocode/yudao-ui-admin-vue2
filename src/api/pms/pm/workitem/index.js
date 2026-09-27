import request from '@/api/pms/request'
// 查询工作项分页
export const getWorkItemPage = (params) => {
    return request.get({ url: '/pms/pm/work-item/page', params })
}
// 查询工作项详情
export const getWorkItem = (id) => {
    return request.get({ url: '/pms/pm/work-item/get', params: { id } })
}
// 查询工作项看板
export const getWorkItemBoard = (params) => {
    return request.get({ url: '/pms/pm/work-item/board', params })
}
// 新增工作项
export const createWorkItem = (data) => {
    return request.post({ url: '/pms/pm/work-item/create', data })
}
// 修改工作项
export const updateWorkItem = (data) => {
    return request.put({ url: '/pms/pm/work-item/update', data })
}
// 修改工作项名称
export const updateWorkItemName = (id, name) => {
    return request.put({ url: '/pms/pm/work-item/update-name', data: { id, name } })
}
// 修改工作项状态
export const updateWorkItemStatus = (id, statusId) => {
    return request.put({ url: '/pms/pm/work-item/update-status', data: { id, statusId } })
}
// 修改工作项所属迭代
export const updateWorkItemIteration = (id, iterationId) => {
    return request.put({ url: '/pms/pm/work-item/update-iteration', data: { id, iterationId } })
}
// 修改看板工作项顺序
export const updateWorkItemSort = (statusId, workItemIds) => {
    return request.put({
        url: '/pms/pm/work-item/update-sort',
        data: { statusId, workItemIds }
    })
}
// 修改待规划工作项个人顺序
export const updateWorkItemPlanningSort = (projectId, iterationId, workItemIds) => {
    return request.put({
        url: '/pms/pm/work-item/update-planning-sort',
        data: { projectId, iterationId, workItemIds }
    })
}
// 归档工作项
export const archiveWorkItem = (id) => {
    return request.put({ url: '/pms/pm/work-item/archive', params: { id } })
}
// 将工作项移入回收站
export const recycleWorkItem = (id) => {
    return request.put({ url: '/pms/pm/work-item/recycle', params: { id } })
}
// 恢复回收站工作项
export const restoreWorkItem = (id) => {
    return request.put({ url: '/pms/pm/work-item/restore', params: { id } })
}
// 彻底删除回收站工作项
export const deleteWorkItem = (id) => {
    return request.delete({ url: '/pms/pm/work-item/delete', params: { id } })
}
// 导出工作项 Excel
export const exportWorkItemList = (params) => {
    return request.download({ url: '/pms/pm/work-item/export-excel', params })
}
// 下载工作项导入模板
export const getWorkItemImportTemplate = () => {
    return request.download({
        url: '/pms/pm/work-item/get-import-template'
    })
}
