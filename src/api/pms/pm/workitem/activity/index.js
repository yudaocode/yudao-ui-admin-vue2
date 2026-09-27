import request from '@/api/pms/request'
// 查询工作项动态列表
export const getWorkItemActivityList = (workItemId) => {
    return request.get({
        url: '/pms/pm/work-item-activity/list',
        params: { workItemId }
    })
}
