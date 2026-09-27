import request from '@/utils/request'

/**
 * @typedef {Object} PointProductVO
 * @property {number=} id 积分商城商品编号
 * @property {number=} activityId 积分商城活动编号
 * @property {number=} spuId 商品 SPU 编号
 * @property {number} skuId 商品 SKU 编号
 * @property {number} count 可兑换次数
 * @property {number} point 所需积分
 * @property {number} price 所需金额，单位：分
 * @property {number} stock 可兑换库存
 * @property {number=} activityStatus 积分商城商品状态
 */

/**
 * @typedef {Object} PointActivityVO
 * @property {number=} id 积分商城活动编号
 * @property {number} spuId 活动商品 SPU 编号
 * @property {number=} status 活动状态
 * @property {number=} stock 活动剩余库存
 * @property {number=} totalStock 活动总库存
 * @property {string=} remark 备注
 * @property {number} sort 排序
 * @property {string=} createTime 创建时间
 * @property {PointProductVO[]} products 积分商城商品配置
 * @property {string=} spuName 商品名称
 * @property {string=} picUrl 商品主图
 * @property {number=} marketPrice 商品市场价，单位：分
 * @property {number=} point 最低兑换积分
 * @property {number=} price 最低兑换金额，单位：分
 */

// 积分商城活动 API
export const PointActivityApi = {
  // 查询积分商城活动分页
  getPointActivityPage(params) {
    return request({
      url: '/promotion/point-activity/page',
      method: 'get',
      params
    })
  },
  // 查询积分商城活动详情
  getPointActivity(id) {
    return request({
      url: '/promotion/point-activity/get?id=' + id,
      method: 'get'
    })
  },
  // 查询积分商城活动列表，基于活动编号数组
  getPointActivityListByIds(ids) {
    const list = Array.isArray(ids) ? ids : [ids]
    return request({
      url: '/promotion/point-activity/list-by-ids?ids=' + list.join(','),
      method: 'get'
    })
  },
  // 新增积分商城活动
  createPointActivity(data) {
    return request({
      url: '/promotion/point-activity/create',
      method: 'post',
      data
    })
  },
  // 修改积分商城活动
  updatePointActivity(data) {
    return request({
      url: '/promotion/point-activity/update',
      method: 'put',
      data
    })
  },
  // 删除积分商城活动
  deletePointActivity(id) {
    return request({
      url: '/promotion/point-activity/delete?id=' + id,
      method: 'delete'
    })
  },
  // 关闭积分商城活动
  closePointActivity(id) {
    return request({
      url: '/promotion/point-activity/close?id=' + id,
      method: 'put'
    })
  }
}
