import request from '@/api/pms/request'
// 查询工作项标签列表
export const getWorkItemLabelList = (name) => {
    return request.get({
        url: '/pms/pm/work-item-label/list',
        params: { name }
    })
}
// 新增工作项标签
export const createWorkItemLabel = (data) => {
    return request.post({ url: '/pms/pm/work-item-label/create', data })
}
// 修改工作项标签
export const updateWorkItemLabel = (data) => {
    return request.put({ url: '/pms/pm/work-item-label/update', data })
}
// 删除工作项标签
export const deleteWorkItemLabel = (id) => {
    return request.delete({ url: '/pms/pm/work-item-label/delete', params: { id } })
}
