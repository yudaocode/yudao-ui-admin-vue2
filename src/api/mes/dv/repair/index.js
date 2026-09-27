import request from '@/utils/request'

export const DvRepairApi = {
  getRepairPage: async(params) => await request({ url: '/mes/dv/repair/page', method: 'get', params }),
  getRepair: async(id) => await request({ url: '/mes/dv/repair/get?id=' + id, method: 'get' }),
  createRepair: async(data) => await request({ url: '/mes/dv/repair/create', method: 'post', data }),
  updateRepair: async(data) => await request({ url: '/mes/dv/repair/update', method: 'put', data }),
  deleteRepair: async(id) => await request({ url: '/mes/dv/repair/delete?id=' + id, method: 'delete' }),
  exportRepair: async(params) => await request({
    url: '/mes/dv/repair/export-excel', method: 'get', params, responseType: 'blob'
  }),
  submitRepair: async(id) => await request({ url: '/mes/dv/repair/submit?id=' + id, method: 'put' }),
  confirmRepair: async(data) => await request({ url: '/mes/dv/repair/confirm', method: 'put', data }),
  finishRepair: async(id, result) => await request({
    url: '/mes/dv/repair/finish?id=' + id + '&result=' + result, method: 'put'
  })
}
