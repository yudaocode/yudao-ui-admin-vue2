import request from '@/utils/request'

// 创建品牌
export function createBrand(data) {
  return request({
    url: '/product/brand/create',
    method: 'post',
    data: data
  })
}

// 更新品牌
export function updateBrand(data) {
  return request({
    url: '/product/brand/update',
    method: 'put',
    data: data
  })
}

// 删除品牌
export function deleteBrand(id) {
  return request({
    url: '/product/brand/delete?id=' + id,
    method: 'delete'
  })
}

// 获得品牌
export function getBrand(id) {
  return request({
    url: '/product/brand/get?id=' + id,
    method: 'get'
  })
}

// 获得商品品牌精简信息列表
export function getSimpleBrandList() {
  return request({
    url: '/product/brand/list-all-simple',
    method: 'get'
  })
}

// 获得品牌分页
export function getBrandParam(query) {
  return request({
    url: '/product/brand/page',
    method: 'get',
    params: query
  })
}
