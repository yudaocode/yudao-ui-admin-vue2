import request from '@/api/pms/request'
// 查询最近浏览列表
export const getKnowledgeRecentViewRecordList = (libraryId) => {
    return request.get({
        url: '/pms/kb/view-record/recent-list',
        params: { libraryId }
    })
}
