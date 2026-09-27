import request from '@/utils/request'

export function getEmployeeCreateFieldConfigList(entryStatus) {
  return request({
    url: '/hrm/employee/config/create-field/list',
    method: 'get',
    params: { entryStatus }
  })
}

export function saveEmployeeCreateFieldConfig(entryStatus, fields) {
  return request({
    url: '/hrm/employee/config/create-field/save',
    method: 'put',
    data: {
      entryStatus,
      fields: fields.map(({ name, visible }) => ({ name, visible }))
    }
  })
}

export function getEmployeeArchiveFieldConfigList() {
  return request({ url: '/hrm/employee/config/archive-field/list', method: 'get' })
}

export function saveEmployeeArchiveFieldConfig(fields) {
  return request({
    url: '/hrm/employee/config/archive-field/save',
    method: 'put',
    data: {
      fields: fields.map(({ name, visible, editable }) => ({ name, visible, editable }))
    }
  })
}
