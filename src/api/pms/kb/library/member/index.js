import request from '@/api/pms/request'
// 查询知识库成员列表
export const getKnowledgeLibraryMemberList = (libraryId) => {
    return request.get({
        url: '/pms/kb/library-member/list',
        params: { libraryId }
    })
}
// 修改知识库成员列表
export const updateKnowledgeLibraryMemberList = (data) => {
    return request.put({ url: '/pms/kb/library-member/update-list', data })
}
// 退出知识库
export const exitKnowledgeLibrary = (libraryId) => {
    return request.delete({ url: '/pms/kb/library-member/exit', params: { libraryId } })
}
