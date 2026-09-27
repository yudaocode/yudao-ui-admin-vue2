import request from '@/utils/request'

// MES 班组成员 API
export const CalTeamMemberApi = {
  // 创建班组成员
  createTeamMember: async(data) => {
    return await request({ url: '/mes/cal/team-member/create', method: 'post', data })
  },

  // 删除班组成员
  deleteTeamMember: async(id) => {
    return await request({ url: '/mes/cal/team-member/delete?id=' + id, method: 'delete' })
  },

  // 查询班组成员分页
  getTeamMemberPage: async(params) => {
    return await request({ url: '/mes/cal/team-member/page', method: 'get', params })
  },

  // 查询指定班组的成员列表
  getTeamMemberListByTeam: async(teamId) => {
    return await request({
      url: '/mes/cal/team-member/list-by-team',
      method: 'get',
      params: { teamId }
    })
  },

  // 查询多个班组的成员列表
  getTeamMemberListByTeamIds: async(teamIds) => {
    return await request({
      url: '/mes/cal/team-member/list-by-team',
      method: 'get',
      params: { teamIds: teamIds.join(',') }
    })
  }
}
