import request from '@/utils/request'

export const BizTypeEnum = Object.freeze({
  CRM_CLUE: 1,
  CRM_CUSTOMER: 2,
  CRM_CONTACT: 3,
  CRM_BUSINESS: 4,
  CRM_CONTRACT: 5,
  CRM_PRODUCT: 6,
  CRM_RECEIVABLE: 7,
  CRM_RECEIVABLE_PLAN: 8
})

export const PermissionLevelEnum = Object.freeze({
  OWNER: 1,
  READ: 2,
  WRITE: 3
})

export function getPermissionList(params) {
  return request({
    url: '/crm/permission/list',
    method: 'get',
    params
  })
}

export function createPermission(data) {
  return request({
    url: '/crm/permission/create',
    method: 'post',
    data
  })
}

export function updatePermission(data) {
  return request({
    url: '/crm/permission/update',
    method: 'put',
    data
  })
}

export function deletePermissionBatch(ids) {
  return request({
    url: '/crm/permission/delete',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

export function deleteSelfPermission(id) {
  return request({
    url: '/crm/permission/delete-self',
    method: 'delete',
    params: { id }
  })
}
