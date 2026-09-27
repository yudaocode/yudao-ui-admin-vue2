import request from '@/utils/request'

// 创建商品分类
export function createCategory(data) {
  return request({
    url: '/product/category/create',
    method: 'post',
    data: data
  })
}

// 更新商品分类
export function updateCategory(data) {
  return request({
    url: '/product/category/update',
    method: 'put',
    data: data
  })
}

// 删除商品分类
export function deleteCategory(id) {
  return request({
    url: '/product/category/delete?id=' + id,
    method: 'delete'
  })
}

// 获得商品分类
export function getCategory(id) {
  return request({
    url: '/product/category/get?id=' + id,
    method: 'get'
  })
}

// 获得商品分类列表
export function getCategoryList(query) {
  return request({
    url: '/product/category/list',
    method: 'get',
    params: query
  })
}
