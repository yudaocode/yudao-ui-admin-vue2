import request from '@/utils/request'
// MES 调拨明细 API
export const WmTransferDetailApi = {
  // 查询调拨明细列表（按行编号）
  getTransferDetailListByLineId: async(lineId) => {
    return await request({ method: 'get', url: '/mes/wm/transfer-detail/list-by-line', params: { lineId }})
  },
  // 查询调拨明细详情
  getTransferDetail: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/transfer-detail/get?id=' + id })
  },
  // 新增调拨明细
  createTransferDetail: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/transfer-detail/create', data })
  },
  // 修改调拨明细
  updateTransferDetail: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/transfer-detail/update', data })
  },
  // 删除调拨明细
  deleteTransferDetail: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/transfer-detail/delete?id=' + id })
  }
}

