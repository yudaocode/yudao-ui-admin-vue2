import request from '@/utils/request'

export const ProWorkRecordApi = {
  getWorkRecordLogPage: params =>
    request({ url: '/mes/pro/workrecord/log/page', method: 'get', params }),
  getWorkRecordLog: id => request({ url: '/mes/pro/workrecord/log/get?id=' + id, method: 'get' }),
  exportWorkRecordLog: params =>
    request({
      url: '/mes/pro/workrecord/log/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    }),
  clockInWorkRecord: workstationId =>
    request({ url: '/mes/pro/workrecord/clock-in?workstationId=' + workstationId, method: 'put' }),
  clockOutWorkRecord: () => request({ url: '/mes/pro/workrecord/clock-out', method: 'put' }),
  getMyWorkRecord: () => request({ url: '/mes/pro/workrecord/get-my', method: 'get' })
}
