import request from '@/utils/request'

export const DvMachineryTypeApi = {
  getMachineryTypeList: async(params) => await request({ url: '/mes/dv/machinery-type/list', method: 'get', params }),
  getMachineryTypeSimpleList: async() => await request({ url: '/mes/dv/machinery-type/simple-list', method: 'get' }),
  getMachineryType: async(id) => await request({ url: '/mes/dv/machinery-type/get?id=' + id, method: 'get' }),
  createMachineryType: async(data) => await request({ url: '/mes/dv/machinery-type/create', method: 'post', data }),
  updateMachineryType: async(data) => await request({ url: '/mes/dv/machinery-type/update', method: 'put', data }),
  deleteMachineryType: async(id) => await request({ url: '/mes/dv/machinery-type/delete?id=' + id, method: 'delete' })
}
