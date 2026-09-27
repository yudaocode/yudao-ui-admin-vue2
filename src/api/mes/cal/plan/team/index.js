import request from '@/utils/request'

// MES 计划班组关联 API
export const CalPlanTeamApi = {
  // 查询指定排班计划的班组列表
  getPlanTeamListByPlan: async(planId) => {
    return await request({
      url: '/mes/cal/plan-team/list-by-plan?planId=' + planId,
      method: 'get'
    })
  },

  // 新增计划班组关联
  createPlanTeam: async(data) => {
    return await request({ url: '/mes/cal/plan-team/create', method: 'post', data })
  },

  // 删除计划班组关联
  deletePlanTeam: async(id) => {
    return await request({ url: '/mes/cal/plan-team/delete?id=' + id, method: 'delete' })
  }
}
