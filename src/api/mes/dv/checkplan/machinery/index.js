import request from '@/utils/request'

export const DvCheckPlanMachineryApi = {
  getListByPlan: async(planId) => await request({
    url: '/mes/dv/check-plan-machinery/list-by-plan?planId=' + planId, method: 'get'
  }),
  create: async(data) => await request({ url: '/mes/dv/check-plan-machinery/create', method: 'post', data }),
  delete: async(id) => await request({ url: '/mes/dv/check-plan-machinery/delete?id=' + id, method: 'delete' })
}
