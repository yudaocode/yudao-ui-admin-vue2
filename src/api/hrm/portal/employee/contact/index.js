import request from '@/utils/request'

export function getEmployeeContactList() {
  return request({ url: '/hrm/portal/employee/contact/list', method: 'get' })
}
