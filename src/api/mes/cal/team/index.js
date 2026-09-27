import request from '@/utils/request'

// MES 班组 API
export const CalTeamApi = {
  // 查询班组分页
  getTeamPage: async(params) => {
    return await request({ url: '/mes/cal/team/page', method: 'get', params })
  },

  // 查询班组详情
  getTeam: async(id) => {
    return await request({ url: '/mes/cal/team/get?id=' + id, method: 'get' })
  },

  // 新增班组
  createTeam: async(data) => {
    return await request({ url: '/mes/cal/team/create', method: 'post', data })
  },

  // 修改班组
  updateTeam: async(data) => {
    return await request({ url: '/mes/cal/team/update', method: 'put', data })
  },

  // 删除班组
  deleteTeam: async(id) => {
    return await request({ url: '/mes/cal/team/delete?id=' + id, method: 'delete' })
  },

  // 获得班组列表（全量，用于下拉选择）
  getTeamList: async() => {
    return await request({ url: '/mes/cal/team/list', method: 'get' })
  },

  // 导出班组 Excel
  exportTeam: async(params) => {
    return await request({
      url: '/mes/cal/team/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
