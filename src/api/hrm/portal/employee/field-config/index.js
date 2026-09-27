import request from '@/utils/request'

export function getEmployeeFieldConfigList() {
  return request({ url: '/hrm/portal/employee/field-config/list', method: 'get' })
}
