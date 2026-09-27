import request from '@/utils/request'
// MES 工具类型 API
export const TmToolTypeApi = {
  // 查询工具类型分页
  getToolTypePage: async(params) => {
    return await request({ method: 'get', url: `/mes/tm/tool-type/page`, params })
  },
  // 查询工具类型精简列表
  getToolTypeSimpleList: async() => {
    return await request({ method: 'get', url: `/mes/tm/tool-type/simple-list` })
  },
  // 查询工具类型详情
  getToolType: async(id) => {
    return await request({ method: 'get', url: `/mes/tm/tool-type/get?id=` + id })
  },
  // 新增工具类型
  createToolType: async(data) => {
    return await request({ method: 'post', url: `/mes/tm/tool-type/create`, data })
  },
  // 修改工具类型
  updateToolType: async(data) => {
    return await request({ method: 'put', url: `/mes/tm/tool-type/update`, data })
  },
  // 删除工具类型
  deleteToolType: async(id) => {
    return await request({ method: 'delete', url: `/mes/tm/tool-type/delete?id=` + id })
  },
  // 导出工具类型 Excel
  exportToolType: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/tm/tool-type/export-excel`, params })
  }
}

