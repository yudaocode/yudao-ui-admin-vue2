import request from '@/utils/request'

/**
 * FMS 凭证字信息
 *
 * @typedef {Object} FmsVoucherWordVO
 * @property {number} id 凭证字编号
 * @property {number} accountSetId 账套编号
 * @property {string} name 凭证字
 * @property {string=} printTitle 打印标题
 * @property {boolean} defaultStatus 是否默认凭证字
 * @property {number=} sort 显示顺序
 * @property {Date=} createTime 创建时间
 */

// FMS 凭证字 API
export const FmsVoucherWordApi = {
  // 查询凭证字列表
  getVoucherWordList(accountSetId) {
    return request({
      url: '/fms/config/voucher-word/list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 查询凭证字精简列表
  getVoucherWordSimpleList(accountSetId) {
    return request({
      url: '/fms/config/voucher-word/simple-list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 新增凭证字
  createVoucherWord(data) {
    return request({
      url: '/fms/config/voucher-word/create',
      method: 'post',
      data
    })
  },

  // 修改凭证字
  updateVoucherWord(data) {
    return request({
      url: '/fms/config/voucher-word/update',
      method: 'put',
      data
    })
  },

  // 删除凭证字
  deleteVoucherWord(accountSetId, id) {
    return request({
      url: '/fms/config/voucher-word/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
