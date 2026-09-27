import request from '@/utils/request'

// 查询员工档案分页
export function getEmployeePage(params) {
  return request({ url: '/hrm/employee/page', method: 'get', params })
}

// 查询员工档案详情
export function getEmployee(id) {
  return request({ url: '/hrm/employee/get?id=' + id, method: 'get' })
}

// 查询指定员工列表
export function getEmployeeList(ids) {
  return request({
    url: '/hrm/employee/list',
    method: 'get',
    params: { ids: ids.join(',') }
  })
}

// 查询员工精简分页
export function getEmployeeSimplePage(params) {
  return request({ url: '/hrm/employee/simple-page', method: 'get', params })
}

// 查询指定员工精简列表
export function getEmployeeSimpleList(ids) {
  return request({
    url: '/hrm/employee/simple-list',
    method: 'get',
    params: { ids: ids.join(',') }
  })
}

// 查询员工状态数量
export function getEmployeeStatusCount(params) {
  return request({ url: '/hrm/employee/status-count', method: 'get', params })
}

// 查询员工部门统计
export function getEmployeeDeptStatistics() {
  return request({ url: '/hrm/employee/dept-statistics', method: 'get' })
}

// 新增员工档案
export function createEmployee(data) {
  return request({ url: '/hrm/employee/create', method: 'post', data })
}

// 从未建档后台用户批量创建员工档案
export function createEmployeeList(data) {
  return request({ url: '/hrm/employee/create-list', method: 'post', data })
}

// 查询已经建立员工档案的后台用户编号
export function getBoundUserIdList() {
  return request({ url: '/hrm/employee/bound-user-id-list', method: 'get' })
}

// 发送填写员工档案通知
export function sendEmployeeProfileFillMessage(employeeIds) {
  return request({
    url: '/hrm/employee/send-profile-fill-message',
    method: 'post',
    params: { ids: employeeIds.join(',') }
  })
}

// 修改员工档案
export function updateEmployee(data) {
  return request({ url: '/hrm/employee/update', method: 'put', data })
}

// 确认员工入职
export function confirmEmployeeEntry(data) {
  return request({ url: '/hrm/employee/confirm-entry', method: 'put', data })
}

// 办理员工再入职
export function rehireEmployee(data) {
  return request({ url: '/hrm/employee/rehire', method: 'post', data })
}

// 办理员工转正
export function regularEmployee(data) {
  return request({ url: '/hrm/employee/regular', method: 'post', data })
}

// 办理员工调岗
export function transferEmployee(data) {
  return request({ url: '/hrm/employee/transfer', method: 'post', data })
}

// 办理员工晋升
export function promoteEmployee(data) {
  return request({ url: '/hrm/employee/promote', method: 'post', data })
}

// 办理员工降级
export function demoteEmployee(data) {
  return request({ url: '/hrm/employee/demote', method: 'post', data })
}

// 办理员工转为全职
export function convertEmployeeToFullTime(data) {
  return request({ url: '/hrm/employee/convert-to-full-time', method: 'post', data })
}

// 办理员工离职
export function quitEmployee(data) {
  return request({ url: '/hrm/employee/quit', method: 'post', data })
}

// 取消员工离职
export function cancelEmployeeQuit(data) {
  return request({ url: '/hrm/employee/cancel-quit', method: 'put', data })
}

// 删除员工档案
export function deleteEmployee(id) {
  return request({ url: '/hrm/employee/delete?id=' + id, method: 'delete' })
}

// 批量删除员工档案
export function deleteEmployeeList(ids) {
  return request({
    url: '/hrm/employee/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

// 导出员工档案
export function exportEmployee(params) {
  return request({ url: '/hrm/employee/export-excel', method: 'get', params, responseType: 'blob' })
}

// 下载员工档案导入模板
export function importEmployeeTemplate() {
  return request({ url: '/hrm/employee/get-import-template', method: 'get', responseType: 'blob' })
}
