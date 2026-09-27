import request from '@/utils/request'

// MES 计划班次 API
export const CalPlanShiftApi = {
  // 查询指定排班计划的班次列表
  getPlanShiftListByPlan: async(planId) => {
    return await request({
      url: '/mes/cal/plan-shift/list-by-plan?planId=' + planId,
      method: 'get'
    })
  },

  // 新增计划班次
  createPlanShift: async(data) => {
    return await request({ url: '/mes/cal/plan-shift/create', method: 'post', data })
  },

  // 修改计划班次
  updatePlanShift: async(data) => {
    return await request({ url: '/mes/cal/plan-shift/update', method: 'put', data })
  },

  // 删除计划班次
  deletePlanShift: async(id) => {
    return await request({ url: '/mes/cal/plan-shift/delete?id=' + id, method: 'delete' })
  }
}
