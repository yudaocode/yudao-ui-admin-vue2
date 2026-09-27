import request from '@/api/pms/request'
// 查询知识内容协作权限
export const getKnowledgeContentPermission = (id) => {
    return request.get({
        url: '/pms/kb/content-permission/get',
        params: { id }
    })
}
// 修改知识内容协作权限
export const updateKnowledgeContentPermission = (data) => {
    return request.put({ url: '/pms/kb/content-permission/update', data })
}
