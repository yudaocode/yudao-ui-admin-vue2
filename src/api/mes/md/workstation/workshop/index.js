import request from '@/utils/request'

export const MdWorkshopApi = {
  getWorkshopPage: async(params) => await request({ url: '/mes/md-workshop/page', method: 'get', params }),
  getWorkshopSimpleList: async() => await request({ url: '/mes/md-workshop/simple-list', method: 'get' }),
  getWorkshop: async(id) => await request({ url: '/mes/md-workshop/get?id=' + id, method: 'get' }),
  createWorkshop: async(data) => await request({ url: '/mes/md-workshop/create', method: 'post', data }),
  updateWorkshop: async(data) => await request({ url: '/mes/md-workshop/update', method: 'put', data }),
  deleteWorkshop: async(id) => await request({ url: '/mes/md-workshop/delete?id=' + id, method: 'delete' }),
  exportWorkshop: async(params) => await request({
    url: '/mes/md-workshop/export-excel', method: 'get', params, responseType: 'blob'
  })
}
