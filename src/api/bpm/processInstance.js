import request from '@/utils/request'

export function getProcessInstanceMyPage(query) {
  return request({
    url: '/bpm/process-instance/my-page',
    method: 'get',
    params: query
  })
}

export function getProcessInstanceManagerPage(query) {
  return request({
    url: '/bpm/process-instance/manager-page',
    method: 'get',
    params: query
  })
}

export function createProcessInstance(data) {
  return request({
    url: '/bpm/process-instance/create',
    method: 'post',
    data: data
  })
}

export function cancelProcessInstanceByStartUser(id, reason) {
  return request({
    url: '/bpm/process-instance/cancel-by-start-user',
    method: 'delete',
    data: {
      id,
      reason
    }
  })
}

export function cancelProcessInstanceByAdmin(id, reason) {
  return request({
    url: '/bpm/process-instance/cancel-by-admin',
    method: 'delete',
    data: {
      id,
      reason
    }
  })
}

export function getProcessInstance(id) {
  return request({
    url: '/bpm/process-instance/get?id=' + id,
    method: 'get'
  })
}

export function getProcessInstanceCopyPage(query) {
  return request({
    url: '/bpm/process-instance/copy/page',
    method: 'get',
    params: query
  })
}

// 获取审批详情
export function getApprovalDetail(query) {
  return request({
    url: '/bpm/process-instance/get-approval-detail',
    method: 'get',
    params: query
  })
}

// 获取下一个执行的流程节点
export function getNextApprovalNodes(query) {
  return request({
    url: '/bpm/process-instance/get-next-approval-nodes',
    method: 'get',
    params: query
  })
}

// 获取表单字段权限
export function getFormFieldsPermission(query) {
  return request({
    url: '/bpm/process-instance/get-form-fields-permission',
    method: 'get',
    params: query
  })
}

// 获取流程实例的 BPMN 模型视图
export function getProcessInstanceBpmnModelView(id) {
  return request({
    url: '/bpm/process-instance/get-bpmn-model-view?id=' + id,
    method: 'get'
  })
}

// 获取流程实例打印数据
export function getProcessInstancePrintData(id) {
  return request({
    url: '/bpm/process-instance/get-print-data?processInstanceId=' + id,
    method: 'get'
  })
}

// ========== 兼容旧版页面的别名（迁移完成后可移除）==========

// 旧版 processInstance/index.vue 使用
export function getMyProcessInstancePage(query) {
  return request({
    url: '/bpm/process-instance/my-page',
    method: 'get',
    params: query
  })
}

// 旧版 processInstance/index.vue 使用（取消流程，旧接口）
export function cancelProcessInstance(id, reason) {
  return request({
    url: '/bpm/process-instance/cancel',
    method: 'delete',
    data: {
      id,
      reason
    }
  })
}
