import request from '@/utils/request'

// 保存仿钉钉流程设计模型
export function updateBpmSimpleModel(data) {
  return request({
    url: '/bpm/model/simple/update',
    method: 'post',
    data: data
  })
}

// 获得仿钉钉流程设计模型
export function getBpmSimpleModel(id) {
  return request({
    url: '/bpm/model/simple/get?id=' + id,
    method: 'get'
  })
}
