import request from '@/utils/request'

export const DvCheckRecordLineApi = {
  getCheckRecordLinePage: async(params) => await request({ url: '/mes/dv/check-record-line/page', method: 'get', params }),
  getCheckRecordLine: async(id) => await request({ url: '/mes/dv/check-record-line/get?id=' + id, method: 'get' }),
  createCheckRecordLine: async(data) => await request({ url: '/mes/dv/check-record-line/create', method: 'post', data }),
  updateCheckRecordLine: async(data) => await request({ url: '/mes/dv/check-record-line/update', method: 'put', data }),
  deleteCheckRecordLine: async(id) => await request({ url: '/mes/dv/check-record-line/delete?id=' + id, method: 'delete' })
}
