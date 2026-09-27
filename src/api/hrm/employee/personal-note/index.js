import request from '@/utils/request'

// 创建员工个人备忘
export function createEmployeePersonalNote(data) {
  return request({ url: '/hrm/employee/personal-note/create', method: 'post', data })
}

// 删除员工个人备忘
export function deleteEmployeePersonalNote(id) {
  return request({
    url: '/hrm/employee/personal-note/delete',
    method: 'delete',
    params: { id }
  })
}
