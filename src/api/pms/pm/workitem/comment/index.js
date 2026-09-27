import request from '@/api/pms/request'
// 查询工作项评论列表
export const getWorkItemCommentList = (workItemId) => {
    return request.get({
        url: '/pms/pm/work-item-comment/list',
        params: { workItemId }
    })
}
// 新增工作项评论
export const createWorkItemComment = (data) => {
    return request.post({ url: '/pms/pm/work-item-comment/create', data })
}
// 修改工作项评论
export const updateWorkItemComment = (data) => {
    return request.put({ url: '/pms/pm/work-item-comment/update', data })
}
// 删除工作项评论
export const deleteWorkItemComment = (id) => {
    return request.delete({ url: '/pms/pm/work-item-comment/delete', params: { id } })
}
