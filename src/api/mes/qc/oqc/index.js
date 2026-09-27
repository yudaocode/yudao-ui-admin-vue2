import request from '@/utils/request'
// MES 出货检验单 API
export const QcOqcApi = {
  // 查询出货检验单分页
  getOqcPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/oqc/page`, params })
  },
  // 查询出货检验单详情
  getOqc: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/oqc/get?id=` + id })
  },
  // 新增出货检验单
  createOqc: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/oqc/create`, data })
  },
  // 修改出货检验单
  updateOqc: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/oqc/update`, data })
  },
  // 完成出货检验单
  finishOqc: async(id) => {
    return await request({ method: 'put', url: `/mes/qc/oqc/finish?id=` + id })
  },
  // 删除出货检验单
  deleteOqc: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/oqc/delete?id=` + id })
  },
  // 导出出货检验单 Excel
  exportOqc: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/qc/oqc/export-excel`, params })
  }
}

