import request from '@/utils/request'
// MES 过程检验单行 API
export const QcIpqcLineApi = {
  // 查询过程检验单行分页
  getIpqcLinePage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/ipqc/line/page`, params })
  },
  // 查询过程检验单行详情
  getIpqcLine: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/ipqc/line/get?id=` + id })
  }
}

