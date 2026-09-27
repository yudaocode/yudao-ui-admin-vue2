import request from '@/utils/request'

export const DvCheckPlanSubjectApi = {
  getListByPlan: async(planId) => await request({
    url: '/mes/dv/check-plan-subject/list-by-plan?planId=' + planId, method: 'get'
  }),
  create: async(data) => await request({ url: '/mes/dv/check-plan-subject/create', method: 'post', data }),
  delete: async(id) => await request({ url: '/mes/dv/check-plan-subject/delete?id=' + id, method: 'delete' })
}
