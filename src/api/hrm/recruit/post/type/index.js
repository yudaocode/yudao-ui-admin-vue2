import request from '@/utils/request'

// 查询招聘职位类型列表
export function getRecruitPostTypeList(params) {
  return request({ url: '/hrm/recruit/post-type/list', method: 'get', params })
}
