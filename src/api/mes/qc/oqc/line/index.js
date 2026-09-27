import request from '@/utils/request'
// MES 出货检验单行 API
export const QcOqcLineApi = {
  // 查询出货检验单行分页
  getOqcLinePage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/oqc/line/page`, params })
  },
  // 查询出货检验单行详情
  getOqcLine: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/oqc/line/get?id=` + id })
  }
}

