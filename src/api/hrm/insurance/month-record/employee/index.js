import request from '@/utils/request'

// 查询员工月度社保分页
export function getInsuranceMonthEmployeeRecordPage(params) {
  return request({ url: '/hrm/insurance/month-employee-record/page', method: 'get', params })
}

// 查询员工月度社保详情
export function getInsuranceMonthEmployeeRecord(id) {
  return request({ url: '/hrm/insurance/month-employee-record/get?id=' + id, method: 'get' })
}

// 修改员工月度参保项目
export function updateInsuranceMonthEmployeeRecord(data) {
  return request({ url: '/hrm/insurance/month-employee-record/update', method: 'put', data })
}

// 停止员工月度参保
export function stopInsuranceMonthEmployeeRecordList(data) {
  return request({ url: '/hrm/insurance/month-employee-record/stop-list', method: 'put', data })
}

// 添加月度参保人员
export function createInsuranceMonthEmployeeRecordList(data) {
  return request({ url: '/hrm/insurance/month-employee-record/create-list', method: 'post', data })
}

// 查询本月未参保员工
export function getUninsuredEmployeeList(monthRecordId) {
  return request({
    url: '/hrm/insurance/month-employee-record/uninsured-employee-list?monthRecordId=' + monthRecordId,
    method: 'get'
  })
}
