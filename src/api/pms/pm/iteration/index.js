import request from '@/api/pms/request'
// 查询迭代分页
export const getIterationPage = (params) => {
    return request.get({ url: '/pms/pm/iteration/page', params })
}
// 查询迭代详情
export const getIteration = (id) => {
    return request.get({ url: '/pms/pm/iteration/get', params: { id } })
}
// 查询迭代概览
export const getIterationOverview = (id) => {
    return request.get({
        url: '/pms/pm/iteration/overview',
        params: { id }
    })
}
// 新增迭代
export const createIteration = (data) => {
    return request.post({ url: '/pms/pm/iteration/create', data })
}
// 修改迭代
export const updateIteration = (data) => {
    return request.put({ url: '/pms/pm/iteration/update', data })
}
// 开始迭代
export const startIteration = (data) => {
    return request.put({ url: '/pms/pm/iteration/start', data })
}
// 完成迭代
export const completeIteration = (id) => {
    return request.put({ url: '/pms/pm/iteration/complete', params: { id } })
}
// 删除迭代
export const deleteIteration = (id) => {
    return request.delete({ url: '/pms/pm/iteration/delete', params: { id } })
}
