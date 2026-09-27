import request from '@/utils/request'
// MES 工具台账 API
export const TmToolApi = {
  // 查询工具台账分页
  getToolPage: async(params) => {
    return await request({ method: 'get', url: `/mes/tm/tool/page`, params })
  },
  // 查询工具台账详情
  getTool: async(id) => {
    return await request({ method: 'get', url: `/mes/tm/tool/get?id=` + id })
  },
  // 新增工具台账
  createTool: async(data) => {
    return await request({ method: 'post', url: `/mes/tm/tool/create`, data })
  },
  // 修改工具台账
  updateTool: async(data) => {
    return await request({ method: 'put', url: `/mes/tm/tool/update`, data })
  },
  // 删除工具台账
  deleteTool: async(id) => {
    return await request({ method: 'delete', url: `/mes/tm/tool/delete?id=` + id })
  },
  // 导出工具台账 Excel
  exportTool: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/tm/tool/export-excel`, params })
  }
}

