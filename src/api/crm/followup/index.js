import request from '@/utils/request'

// 跟进记录 API
export const FollowUpRecordApi = {
  // 查询跟进记录分页
  getFollowUpRecordPage(params) {
    return request({
      url: '/crm/follow-up-record/page',
      method: 'get',
      params
    })
  },

  // 新增跟进记录
  createFollowUpRecord(data) {
    return request({
      url: '/crm/follow-up-record/create',
      method: 'post',
      data
    })
  },

  // 删除跟进记录
  deleteFollowUpRecord(id) {
    return request({
      url: '/crm/follow-up-record/delete',
      method: 'delete',
      params: { id }
    })
  }
}
