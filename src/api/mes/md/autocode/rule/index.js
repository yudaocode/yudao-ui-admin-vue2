import request from '@/utils/request'

export const AutoCodeRuleApi = {
  getAutoCodeRulePage: params => request({ url: '/mes/md/auto-code-rule/page', method: 'get', params }),
  getAutoCodeRule: id => request({ url: '/mes/md/auto-code-rule/get?id=' + id, method: 'get' }),
  createAutoCodeRule: data => request({ url: '/mes/md/auto-code-rule/create', method: 'post', data }),
  updateAutoCodeRule: data => request({ url: '/mes/md/auto-code-rule/update', method: 'put', data }),
  deleteAutoCodeRule: id => request({ url: '/mes/md/auto-code-rule/delete?id=' + id, method: 'delete' }),
  exportAutoCodeRule: params => request({
    url: '/mes/md/auto-code-rule/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
