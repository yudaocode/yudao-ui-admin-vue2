import request from '@/utils/request'
// MES 转移单 API
export const WmTransferApi = {
  // 查询转移单分页
  getTransferPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/transfer/page', params })
  },
  // 查询转移单详情
  getTransfer: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/transfer/get?id=' + id })
  },
  // 新增转移单
  createTransfer: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/transfer/create', data })
  },
  // 修改转移单
  updateTransfer: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/transfer/update', data })
  },
  // 删除转移单
  deleteTransfer: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/transfer/delete?id=' + id })
  },
  // 提交转移单
  submitTransfer: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/transfer/submit?id=' + id })
  },
  // 到货确认
  confirmTransfer: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/transfer/confirm?id=' + id })
  },
  // 执行上架
  stockTransfer: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/transfer/stock?id=' + id })
  },
  // 完成转移
  finishTransfer: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/transfer/finish?id=' + id })
  },
  // 取消转移单
  cancelTransfer: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/transfer/cancel?id=' + id })
  },
  // 导出转移单 Excel
  exportTransfer: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/transfer/export-excel', params })
  }
}

