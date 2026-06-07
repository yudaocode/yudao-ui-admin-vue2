import request from '@/utils/request'

// 查询流程分类分页
export function getCategoryPage(query) {
  return request({
    url: '/bpm/category/page',
    method: 'get',
    params: query
  })
}

// 查询流程分类列表
export function getCategorySimpleList() {
  return request({
    url: '/bpm/category/simple-list',
    method: 'get'
  })
}

// 查询流程分类详情
export function getCategory(id) {
  return request({
    url: '/bpm/category/get?id=' + id,
    method: 'get'
  })
}

// 新增流程分类
export function createCategory(data) {
  return request({
    url: '/bpm/category/create',
    method: 'post',
    data: data
  })
}

// 修改流程分类
export function updateCategory(data) {
  return request({
    url: '/bpm/category/update',
    method: 'put',
    data: data
  })
}

// 批量修改流程分类的排序
export function updateCategorySortBatch(ids) {
  return request({
    url: '/bpm/category/update-sort-batch',
    method: 'put',
    params: {
      ids: ids.join(',')
    }
  })
}

// 删除流程分类
export function deleteCategory(id) {
  return request({
    url: '/bpm/category/delete?id=' + id,
    method: 'delete'
  })
}
