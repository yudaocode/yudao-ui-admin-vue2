import request from '@/utils/request'

// ERP 供应商 API，与 Vue3 /erp/supplier controller 保持一致
export function getSupplierPage(query) { return request({ url: '/erp/supplier/page', method: 'get', params: query }) }
export function getSupplierSimpleList() { return request({ url: '/erp/supplier/simple-list', method: 'get' }) }
export function getSupplier(id) { return request({ url: '/erp/supplier/get?id=' + id, method: 'get' }) }
export function createSupplier(data) { return request({ url: '/erp/supplier/create', method: 'post', data }) }
export function updateSupplier(data) { return request({ url: '/erp/supplier/update', method: 'put', data }) }
export function deleteSupplier(id) { return request({ url: '/erp/supplier/delete?id=' + id, method: 'delete' }) }
export function exportSupplier(query) { return request({ url: '/erp/supplier/export-excel', method: 'get', params: query, responseType: 'blob' }) }
