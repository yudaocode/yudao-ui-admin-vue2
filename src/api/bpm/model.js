import request from '@/utils/request'

// 获得流程模型列表
export function getModelList(name) {
  return request({
    url: '/bpm/model/list',
    method: 'get',
    params: { name }
  })
}

export function getModel(id) {
  return request({
    url: '/bpm/model/get?id=' + id,
    method: 'get'
  })
}

export function updateModel(data) {
  return request({
    url: '/bpm/model/update',
    method: 'put',
    data: data
  })
}

// 批量修改流程模型的排序
export function updateModelSortBatch(ids) {
  return request({
    url: '/bpm/model/update-sort-batch',
    method: 'put',
    params: {
      ids: ids.join(',')
    }
  })
}

// 修改模型的 BPMN
export function updateModelBpmn(data) {
  return request({
    url: '/bpm/model/update-bpmn',
    method: 'put',
    data: data
  })
}

// 任务状态修改
export function updateModelState(id, state) {
  return request({
    url: '/bpm/model/update-state',
    method: 'put',
    data: {
      id,
      state
    }
  })
}

export function createModel(data) {
  return request({
    url: '/bpm/model/create',
    method: 'post',
    data: data
  })
}

export function deleteModel(id) {
  return request({
    url: '/bpm/model/delete?id=' + id,
    method: 'delete'
  })
}

export function deployModel(id) {
  return request({
    url: '/bpm/model/deploy?id=' + id,
    method: 'post'
  })
}

// 清理模型的流程定义
export function cleanModel(id) {
  return request({
    url: '/bpm/model/clean?id=' + id,
    method: 'delete'
  })
}
