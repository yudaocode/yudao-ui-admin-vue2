import request from '@/utils/request'

// 获得考勤组分页
export function getAttendanceGroupPage(params) {
  return request({ url: '/hrm/attendance/group/page', method: 'get', params })
}

// 获得考勤组详情
export function getAttendanceGroup(id) {
  return request({ url: '/hrm/attendance/group/get?id=' + id, method: 'get' })
}

// 获得员工所在考勤组
export function getMyAttendanceGroup(employeeId) {
  return request({
    url: '/hrm/attendance/group/my?employeeId=' + employeeId,
    method: 'get'
  })
}

// 创建考勤组
export function createAttendanceGroup(data) {
  return request({ url: '/hrm/attendance/group/create', method: 'post', data })
}

// 修改考勤组
export function updateAttendanceGroup(data) {
  return request({ url: '/hrm/attendance/group/update', method: 'put', data })
}

// 删除考勤组
export function deleteAttendanceGroup(id) {
  return request({ url: '/hrm/attendance/group/delete?id=' + id, method: 'delete' })
}
