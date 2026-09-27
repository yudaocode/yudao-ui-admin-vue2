import request from '@/utils/request'

// AI 工具 API
export const ToolApi = {
  // 查询工具分页
  getToolPage(params) {
    return request({ url: '/ai/tool/page', method: 'get', params })
  },

  // 查询工具详情
  getTool(id) {
    return request({ url: '/ai/tool/get?id=' + id, method: 'get' })
  },

  // 新增工具
  createTool(data) {
    return request({ url: '/ai/tool/create', method: 'post', data })
  },

  // 修改工具
  updateTool(data) {
    return request({ url: '/ai/tool/update', method: 'put', data })
  },

  // 删除工具
  deleteTool(id) {
    return request({ url: '/ai/tool/delete?id=' + id, method: 'delete' })
  },

  // 获取工具简单列表
  getToolSimpleList() {
    return request({ url: '/ai/tool/simple-list', method: 'get' })
  }
}
