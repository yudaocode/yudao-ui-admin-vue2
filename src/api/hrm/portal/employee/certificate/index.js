import request from '@/utils/request'

export function getEmployeeCertificateList() {
  return request({ url: '/hrm/portal/employee/certificate/list', method: 'get' })
}
