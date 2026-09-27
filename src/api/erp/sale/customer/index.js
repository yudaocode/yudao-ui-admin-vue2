import request from '@/utils/request'

// ERP 客户 API，与 Vue3 /erp/customer controller 保持一致
export function getCustomerPage(query) { return request({ url: '/erp/customer/page', method: 'get', params: query }) }
export function getCustomerSimpleList() { return request({ url: '/erp/customer/simple-list', method: 'get' }) }
export function getCustomer(id) { return request({ url: '/erp/customer/get?id=' + id, method: 'get' }) }
export function createCustomer(data) { return request({ url: '/erp/customer/create', method: 'post', data }) }
export function updateCustomer(data) { return request({ url: '/erp/customer/update', method: 'put', data }) }
export function deleteCustomer(id) { return request({ url: '/erp/customer/delete?id=' + id, method: 'delete' }) }
export function exportCustomer(query) { return request({ url: '/erp/customer/export-excel', method: 'get', params: query, responseType: 'blob' }) }
