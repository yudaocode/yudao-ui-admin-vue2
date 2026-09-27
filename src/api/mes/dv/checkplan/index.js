import request from '@/utils/request'

export const DvCheckPlanApi = {
  getCheckPlanPage: async(params) => await request({ url: '/mes/dv/check-plan/page', method: 'get', params }),
  getCheckPlan: async(id) => await request({ url: '/mes/dv/check-plan/get?id=' + id, method: 'get' }),
  createCheckPlan: async(data) => await request({ url: '/mes/dv/check-plan/create', method: 'post', data }),
  updateCheckPlan: async(data) => await request({ url: '/mes/dv/check-plan/update', method: 'put', data }),
  enableCheckPlan: async(id) => await request({ url: '/mes/dv/check-plan/enable?id=' + id, method: 'put' }),
  disableCheckPlan: async(id) => await request({ url: '/mes/dv/check-plan/disable?id=' + id, method: 'put' }),
  deleteCheckPlan: async(id) => await request({ url: '/mes/dv/check-plan/delete?id=' + id, method: 'delete' }),
  exportCheckPlan: async(params) => await request({
    url: '/mes/dv/check-plan/export-excel', method: 'get', params, responseType: 'blob'
  })
}
