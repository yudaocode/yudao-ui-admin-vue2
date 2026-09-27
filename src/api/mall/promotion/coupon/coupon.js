import request from '@/utils/request'

// 删除优惠劵（回收会员未使用的优惠券）
export function deleteCoupon(id) {
  return request({
    url: '/promotion/coupon/delete?id=' + id,
    method: 'delete'
  })
}

// 获得优惠劵分页
export function getCouponPage(query) {
  return request({
    url: '/promotion/coupon/page',
    method: 'get',
    params: query
  })
}

// 发送优惠券给指定会员
export function sendCoupon(data) {
  return request({
    url: '/promotion/coupon/send',
    method: 'post',
    data: data
  })
}
