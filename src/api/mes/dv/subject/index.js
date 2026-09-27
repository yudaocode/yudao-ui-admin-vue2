import request from '@/utils/request'

export const DvSubjectApi = {
  getSubjectPage: async(params) => await request({ url: '/mes/dv/subject/page', method: 'get', params }),
  getSubject: async(id) => await request({ url: '/mes/dv/subject/get?id=' + id, method: 'get' }),
  createSubject: async(data) => await request({ url: '/mes/dv/subject/create', method: 'post', data }),
  updateSubject: async(data) => await request({ url: '/mes/dv/subject/update', method: 'put', data }),
  deleteSubject: async(id) => await request({ url: '/mes/dv/subject/delete?id=' + id, method: 'delete' }),
  exportSubject: async(params) => await request({
    url: '/mes/dv/subject/export-excel', method: 'get', params, responseType: 'blob'
  })
}
