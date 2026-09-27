import request from '@/utils/request'

export const AutoCodePartApi = {
  getAutoCodePart: id => request({ url: '/mes/md/auto-code-part/get?id=' + id, method: 'get' }),
  getAutoCodePartListByRuleId: ruleId => request({
    url: '/mes/md/auto-code-part/list-by-rule-id?ruleId=' + ruleId,
    method: 'get'
  }),
  createAutoCodePart: data => request({ url: '/mes/md/auto-code-part/create', method: 'post', data }),
  updateAutoCodePart: data => request({ url: '/mes/md/auto-code-part/update', method: 'put', data }),
  deleteAutoCodePart: id => request({ url: '/mes/md/auto-code-part/delete?id=' + id, method: 'delete' })
}
