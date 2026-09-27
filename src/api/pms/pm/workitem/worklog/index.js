import request from '@/api/pms/request'
// 查询工作项工时记录详情
export const getWorkItemWorkLog = (id) => {
    return request.get({
        url: '/pms/pm/work-item-work-log/get',
        params: { id }
    })
}
// 查询工时汇总
export const getWorkItemWorkLogSummary = (workItemId) => {
    return request.get({
        url: '/pms/pm/work-item-work-log/summary',
        params: { workItemId }
    })
}
// 新增工作项工时
export const createWorkItemWorkLog = (data) => {
    return request.post({ url: '/pms/pm/work-item-work-log/create', data })
}
// 修改工作项工时
export const updateWorkItemWorkLog = (data) => {
    return request.put({ url: '/pms/pm/work-item-work-log/update', data })
}
// 查询项目工时报表
export const getProjectWorkItemWorkLogReport = (params) => {
    return request.get({
        url: '/pms/pm/work-item-work-log/project-report',
        params
    })
}
