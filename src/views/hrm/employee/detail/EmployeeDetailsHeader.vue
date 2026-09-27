<template><div v-loading="loading"><div class="header-row"><div><div class="title-row"><span class="employee-name">{{ employee.name || '-' }}</span><dict-tag
  v-if="employee.entryStatus != null"
  :type="DICT_TYPE.HRM_EMPLOYEE_ENTRY_STATUS"
  :value="employee.entryStatus"
/><dict-tag
  v-if="employee.status != null"
  :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
  :value="employee.status"
/></div><div class="employee-id">员工编号：{{ employee.id || '-' }}</div></div><div><slot /></div></div><el-card
  shadow="never"
  class="summary"
><el-descriptions
  :column="5"
  direction="vertical"
><el-descriptions-item label="所属部门">{{ employee.deptName || '-' }}</el-descriptions-item><el-descriptions-item label="岗位">{{ employee.postName || '-' }}</el-descriptions-item><el-descriptions-item label="工号">{{ employee.jobNumber || '-' }}</el-descriptions-item><el-descriptions-item label="手机号">{{ employee.mobile || '-' }}</el-descriptions-item><el-descriptions-item label="直属上级">{{ employee.leaderEmployeeName || '-' }}</el-descriptions-item></el-descriptions></el-card></div></template>
<script>import { DICT_TYPE } from '@/utils/dict'; export default { name: 'HrmEmployeeDetailsHeader', props: { employee: { type: Object, required: true }, loading: { type: Boolean, required: true }}, data() { return { DICT_TYPE } } }</script>
<style scoped>.header-row,.title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }.title-row { justify-content:flex-start; gap:10px; flex-wrap:wrap; }.employee-name { font-size:20px; font-weight:bold; }.employee-id { margin-top:6px; color:#909399; font-size:14px; }.summary { margin-top:10px; }</style>
