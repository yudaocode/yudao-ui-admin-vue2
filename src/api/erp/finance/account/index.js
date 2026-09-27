import request from '@/utils/request'

// ERP 结算账户 API，与 Vue3 /erp/account controller 保持一致
export function getAccountPage(query) { return request({ url: '/erp/account/page', method: 'get', params: query }) }
export function getAccountSimpleList() { return request({ url: '/erp/account/simple-list', method: 'get' }) }
export function getAccount(id) { return request({ url: '/erp/account/get?id=' + id, method: 'get' }) }
export function createAccount(data) { return request({ url: '/erp/account/create', method: 'post', data }) }
export function updateAccount(data) { return request({ url: '/erp/account/update', method: 'put', data }) }
export function updateAccountDefaultStatus(id, defaultStatus) { return request({ url: '/erp/account/update-default-status', method: 'put', params: { id, defaultStatus }}) }
export function deleteAccount(id) { return request({ url: '/erp/account/delete?id=' + id, method: 'delete' }) }
export function exportAccount(query) { return request({ url: '/erp/account/export-excel', method: 'get', params: query, responseType: 'blob' }) }
