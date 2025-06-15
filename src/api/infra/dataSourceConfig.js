import request from '@/utils/request'

// 创建数据源配置
export function createDataSourceConfig(data) {
  return request({
    url: '/infra/data-source-config/create',
    method: 'post',
    data: data
  })
}

// 更新数据源配置
export function updateDataSourceConfig(data) {
  return request({
    url: '/infra/data-source-config/update',
    method: 'put',
    data: data
  })
}

// 删除数据源配置
export function deleteDataSourceConfig(id) {
  return request({
    url: '/infra/data-source-config/delete?id=' + id,
    method: 'delete'
  })
}

// 批量删除数据源配置
export function deleteDataSourceConfigList(ids) {
  return request({
    url: `/infra/data-source-config/delete-list?ids=${ids.join(',')}`,
    method: 'delete'
  })
}

// 获得数据源配置
export function getDataSourceConfig(id) {
  return request({
    url: '/infra/data-source-config/get?id=' + id,
    method: 'get'
  })
}

// 获得数据源配置列表
export function getDataSourceConfigList() {
  return request({
    url: '/infra/data-source-config/list',
    method: 'get',
  })
}
