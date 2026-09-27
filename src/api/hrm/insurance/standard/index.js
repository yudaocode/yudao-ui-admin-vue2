import request from '@/utils/request'

// 查询标准参保类型列表
export function getInsuranceStandardTypeList(areaId) {
  return request({
    url: '/hrm/insurance/standard/type-list',
    method: 'get',
    params: { areaId }
  })
}

// 查询标准参保项目列表
export function getInsuranceStandardProjectList(params) {
  return request({
    url: '/hrm/insurance/standard/project-list',
    method: 'get',
    params
  })
}
