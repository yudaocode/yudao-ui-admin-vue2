import request from '@/utils/request'

export const DvMaintenRecordLineApi = {
  getMaintenRecordLinePage: async(params) => await request({ url: '/mes/dv/mainten-record-line/page', method: 'get', params }),
  getMaintenRecordLine: async(id) => await request({ url: '/mes/dv/mainten-record-line/get?id=' + id, method: 'get' }),
  createMaintenRecordLine: async(data) => await request({ url: '/mes/dv/mainten-record-line/create', method: 'post', data }),
  updateMaintenRecordLine: async(data) => await request({ url: '/mes/dv/mainten-record-line/update', method: 'put', data }),
  deleteMaintenRecordLine: async(id) => await request({ url: '/mes/dv/mainten-record-line/delete?id=' + id, method: 'delete' })
}
