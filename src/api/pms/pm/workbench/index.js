import request from '@/api/pms/request'
// 查询工作台待办统计
export const getWorkbenchCount = (params) => {
    return request.get({
        url: '/pms/pm/workbench/count',
        params
    })
}
// 查询工作台工作项分页
export const getWorkbenchWorkItemPage = (params) => {
    return request.get({
        url: '/pms/pm/workbench/work-item-page',
        params
    })
}
// 查询工作台迭代分页
export const getWorkbenchIterationPage = (params) => {
    return request.get({
        url: '/pms/pm/workbench/iteration-page',
        params
    })
}
