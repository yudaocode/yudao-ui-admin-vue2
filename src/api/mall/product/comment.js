import request from '@/utils/request'

// 查询商品评论列表
export function getCommentPage(query) {
  return request({
    url: '/product/comment/page',
    method: 'get',
    params: query
  })
}

// 查询商品评论详情
export function getComment(id) {
  return request({
    url: '/product/comment/get?id=' + id,
    method: 'get'
  })
}

// 添加自评
export function createComment(data) {
  return request({
    url: '/product/comment/create',
    method: 'post',
    data: data
  })
}

// 显示 / 隐藏评论
export function updateCommentVisible(data) {
  return request({
    url: '/product/comment/update-visible',
    method: 'put',
    data: data
  })
}

// 商家回复
export function replyComment(data) {
  return request({
    url: '/product/comment/reply',
    method: 'put',
    data: data
  })
}
