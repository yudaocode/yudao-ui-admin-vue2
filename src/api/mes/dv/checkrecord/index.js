import request from '@/utils/request'

export const DvCheckRecordApi = {
  getCheckRecordPage: async(params) => await request({ url: '/mes/dv/check-record/page', method: 'get', params }),
  getCheckRecord: async(id) => await request({ url: '/mes/dv/check-record/get?id=' + id, method: 'get' }),
  createCheckRecord: async(data) => await request({ url: '/mes/dv/check-record/create', method: 'post', data }),
  updateCheckRecord: async(data) => await request({ url: '/mes/dv/check-record/update', method: 'put', data }),
  submitCheckRecord: async(id) => await request({ url: '/mes/dv/check-record/submit?id=' + id, method: 'put' }),
  deleteCheckRecord: async(id) => await request({ url: '/mes/dv/check-record/delete?id=' + id, method: 'delete' }),
  exportCheckRecord: async(params) => await request({
    url: '/mes/dv/check-record/export-excel', method: 'get', params, responseType: 'blob'
  })
}
