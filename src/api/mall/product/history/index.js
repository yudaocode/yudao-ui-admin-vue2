import request from '@/utils/request'

/** 获得商品浏览记录分页 */
export function getBrowseHistoryPage(params) {
  return request({
    url: '/product/browse-history/page',
    method: 'get',
    params
  })
}
