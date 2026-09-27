import request from '@/utils/request'

// MES 班组排班 API
export const CalTeamShiftApi = {
  // 查询班组排班列表
  getTeamShiftList: async(params) => {
    return await request({ url: '/mes/cal/team-shift/list', method: 'get', params })
  }
}
