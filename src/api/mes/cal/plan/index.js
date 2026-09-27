import request from '@/utils/request'

// MES 排班计划 API
export const CalPlanApi = {
  // 查询排班计划分页
  getPlanPage: async(params) => {
    return await request({ url: '/mes/cal/plan/page', method: 'get', params })
  },

  // 查询排班计划详情
  getPlan: async(id) => {
    return await request({ url: '/mes/cal/plan/get?id=' + id, method: 'get' })
  },

  // 新增排班计划
  createPlan: async(data) => {
    return await request({ url: '/mes/cal/plan/create', method: 'post', data })
  },

  // 修改排班计划
  updatePlan: async(data) => {
    return await request({ url: '/mes/cal/plan/update', method: 'put', data })
  },

  // 确认排班计划
  confirmPlan: async(id) => {
    return await request({ url: '/mes/cal/plan/confirm?id=' + id, method: 'put' })
  },

  // 删除排班计划
  deletePlan: async(id) => {
    return await request({ url: '/mes/cal/plan/delete?id=' + id, method: 'delete' })
  },

  // 导出排班计划 Excel
  exportPlan: async(params) => {
    return await request({
      url: '/mes/cal/plan/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
