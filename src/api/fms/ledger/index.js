import request from '@/utils/request'

// FMS 账簿 API
export const FmsLedgerApi = {
  getDetailList(params) {
    return request({ url: '/fms/ledger/detail/list', method: 'get', params })
  },
  exportDetail(params) {
    return request({ url: '/fms/ledger/detail/export-excel', method: 'get', params, responseType: 'blob' })
  },
  getGeneralList(params) {
    return request({ url: '/fms/ledger/general/list', method: 'get', params })
  },
  exportGeneral(params) {
    return request({ url: '/fms/ledger/general/export-excel', method: 'get', params, responseType: 'blob' })
  },
  getSubjectBalanceList(params) {
    return request({ url: '/fms/ledger/subject-balance/list', method: 'get', params })
  },
  exportSubjectBalance(params) {
    return request({ url: '/fms/ledger/subject-balance/export-excel', method: 'get', params, responseType: 'blob' })
  },
  getMultiColumn(params) {
    return request({ url: '/fms/ledger/multi-column/list', method: 'get', params })
  },
  exportMultiColumn(params) {
    return request({ url: '/fms/ledger/multi-column/export-excel', method: 'get', params, responseType: 'blob' })
  },
  getAuxiliaryDetailList(params) {
    return request({ url: '/fms/ledger/auxiliary-detail/list', method: 'get', params })
  },
  exportAuxiliaryDetail(params) {
    return request({ url: '/fms/ledger/auxiliary-detail/export-excel', method: 'get', params, responseType: 'blob' })
  },
  getAuxiliaryBalanceList(params) {
    return request({ url: '/fms/ledger/auxiliary-balance/list', method: 'get', params })
  },
  exportAuxiliaryBalance(params) {
    return request({ url: '/fms/ledger/auxiliary-balance/export-excel', method: 'get', params, responseType: 'blob' })
  },
  getQuantityDetailList(params) {
    return request({ url: '/fms/ledger/quantity-detail/list', method: 'get', params })
  },
  exportQuantityDetail(params) {
    return request({ url: '/fms/ledger/quantity-detail/export-excel', method: 'get', params, responseType: 'blob' })
  },
  getQuantityGeneralList(params) {
    return request({ url: '/fms/ledger/quantity-general/list', method: 'get', params })
  },
  exportQuantityGeneral(params) {
    return request({ url: '/fms/ledger/quantity-general/export-excel', method: 'get', params, responseType: 'blob' })
  }
}
