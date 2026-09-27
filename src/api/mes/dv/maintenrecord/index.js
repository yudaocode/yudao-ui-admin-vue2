import request from '@/utils/request'

export const DvMaintenRecordApi = {
  getMaintenRecordPage: async(params) => await request({ url: '/mes/dv/mainten-record/page', method: 'get', params }),
  getMaintenRecord: async(id) => await request({ url: '/mes/dv/mainten-record/get?id=' + id, method: 'get' }),
  createMaintenRecord: async(data) => await request({ url: '/mes/dv/mainten-record/create', method: 'post', data }),
  updateMaintenRecord: async(data) => await request({ url: '/mes/dv/mainten-record/update', method: 'put', data }),
  submitMaintenRecord: async(id) => await request({ url: '/mes/dv/mainten-record/submit?id=' + id, method: 'put' }),
  deleteMaintenRecord: async(id) => await request({ url: '/mes/dv/mainten-record/delete?id=' + id, method: 'delete' }),
  exportMaintenRecord: async(params) => await request({
    url: '/mes/dv/mainten-record/export-excel', method: 'get', params, responseType: 'blob'
  })
}
