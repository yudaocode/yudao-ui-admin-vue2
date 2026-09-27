import request from '@/utils/request'

export const DvRepairLineApi = {
  getRepairLinePage: async(params) => await request({ url: '/mes/dv/repair-line/page', method: 'get', params }),
  getRepairLine: async(id) => await request({ url: '/mes/dv/repair-line/get?id=' + id, method: 'get' }),
  createRepairLine: async(data) => await request({ url: '/mes/dv/repair-line/create', method: 'post', data }),
  updateRepairLine: async(data) => await request({ url: '/mes/dv/repair-line/update', method: 'put', data }),
  deleteRepairLine: async(id) => await request({ url: '/mes/dv/repair-line/delete?id=' + id, method: 'delete' })
}
