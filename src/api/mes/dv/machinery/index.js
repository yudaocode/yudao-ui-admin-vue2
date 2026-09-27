import request from '@/utils/request'

export const DvMachineryApi = {
  getMachineryPage: async(params) => await request({ url: '/mes/dv/machinery/page', method: 'get', params }),
  getMachinery: async(id) => await request({ url: '/mes/dv/machinery/get?id=' + id, method: 'get' }),
  createMachinery: async(data) => await request({ url: '/mes/dv/machinery/create', method: 'post', data }),
  updateMachinery: async(data) => await request({ url: '/mes/dv/machinery/update', method: 'put', data }),
  deleteMachinery: async(id) => await request({ url: '/mes/dv/machinery/delete?id=' + id, method: 'delete' }),
  exportMachinery: async(params) => await request({
    url: '/mes/dv/machinery/export-excel', method: 'get', params, responseType: 'blob'
  }),
  importTemplate: async() => await request({
    url: '/mes/dv/machinery/get-import-template', method: 'get', responseType: 'blob'
  })
}
