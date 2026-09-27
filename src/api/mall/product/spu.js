import request from '@/utils/request'

// 创建商品 SPU
export function createSpu(data) {
  return request({
    url: '/product/spu/create',
    method: 'post',
    data: data
  })
}

// 更新商品 SPU
export function updateSpu(data) {
  return request({
    url: '/product/spu/update',
    method: 'put',
    data: data
  })
}

// 删除商品 SPU
export function deleteSpu(id) {
  return request({
    url: '/product/spu/delete?id=' + id,
    method: 'delete'
  })
}

// 获得商品 SPU
export function getSpu(id) {
  return request({
    url: '/product/spu/get-detail?id=' + id,
    method: 'get'
  })
}

// 获得商品 SPU 分页
export function getSpuPage(query) {
  return request({
    url: '/product/spu/page',
    method: 'get',
    params: query
  })
}

// 获得商品 SPU 列表 tabs 数量
export function getTabsCount(query) {
  return request({
    url: '/product/spu/get-count',
    method: 'get',
    params: query
  })
}

// 更新商品 SPU 状态（上架、下架、回收、恢复）
export function updateStatus(data) {
  return request({
    url: '/product/spu/update-status',
    method: 'put',
    data: data
  })
}

// 获得商品 SPU 详情列表
export function getSpuDetailList(ids) {
  const list = Array.isArray(ids) ? ids : [ids]
  return request({
    url: '/product/spu/list?spuIds=' + list.filter(id => id !== undefined && id !== null).join(','),
    method: 'get'
  })
}

// 导出商品 SPU
export function exportSpu(query) {
  return request({
    url: '/product/spu/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// 获得商品 SPU 精简列表
export function getSpuSimpleList() {
  return request({
    url: '/product/spu/list-all-simple',
    method: 'get'
  })
}
