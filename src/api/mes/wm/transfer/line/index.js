import request from '@/utils/request'
// MES 转移单行 API
export const WmTransferLineApi = {
  // 查询转移单行列表
  getTransferLineList: async(transferId) => {
    return await request({ method: 'get', url: '/mes/wm/transfer-line/list', params: { transferId }})
  },
  // 查询转移单行详情
  getTransferLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/transfer-line/get?id=' + id })
  },
  // 新增转移单行
  createTransferLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/transfer-line/create', data })
  },
  // 修改转移单行
  updateTransferLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/transfer-line/update', data })
  },
  // 删除转移单行
  deleteTransferLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/transfer-line/delete?id=' + id })
  }
}

