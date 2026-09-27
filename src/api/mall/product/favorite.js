import request from '@/utils/request'

// 获得 ProductFavorite 列表
export function getFavoritePage(params) {
  return request({
    url: '/product/favorite/page',
    method: 'get',
    params
  })
}
