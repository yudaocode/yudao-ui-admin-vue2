<template><el-card
  v-if="quitInfo"
  v-loading="loading"
  shadow="never"
  class="section-card"
><div
  slot="header"
  class="card-header"
><span>离职信息</span><el-button
  v-hasPermi="['hrm:employee:update']"
  type="primary"
  plain
  icon="el-icon-edit"
  @click="$emit('edit')"
>编辑离职信息</el-button></div><el-descriptions
  :column="3"
  border
><el-descriptions-item label="计划离职时间">{{ formatHrmDateTime(quitInfo.planQuitTime) }}</el-descriptions-item><el-descriptions-item label="申请离职">{{ formatHrmDate(quitInfo.applyQuitTime) }}</el-descriptions-item><el-descriptions-item label="薪资结算">{{ formatHrmDate(quitInfo.salarySettlementTime) }}</el-descriptions-item><el-descriptions-item label="离职类型">{{ formatEmployeeQuitType(quitInfo.type) }}</el-descriptions-item><el-descriptions-item label="离职原因">{{ formatEmployeeQuitReason(quitInfo.reason) }}</el-descriptions-item><el-descriptions-item label="原员工状态"><dict-tag
  v-if="quitInfo.oldEmployeeStatus != null"
  :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
  :value="quitInfo.oldEmployeeStatus"
/><span v-else>-</span></el-descriptions-item><el-descriptions-item
  label="备注"
  :span="3"
>{{ quitInfo.remark || '-' }}</el-descriptions-item></el-descriptions></el-card></template>
<script>import { DICT_TYPE } from '@/utils/dict'; import { getEmployeeQuitInfo } from '@/api/hrm/employee/quit-info'; import { formatEmployeeQuitReason, formatEmployeeQuitType, formatHrmDate, formatHrmDateTime } from '@/views/hrm/utils/format'; export default { name: 'HrmEmployeeQuitInfo', props: { employeeId: { type: Number, required: true }}, data() { return { DICT_TYPE, loading: false, quitInfo: undefined } }, created() { this.getQuitInfo() }, methods: { formatEmployeeQuitReason, formatEmployeeQuitType, formatHrmDate, formatHrmDateTime, async getQuitInfo() { this.loading = true; try { const response = await getEmployeeQuitInfo(this.employeeId); this.quitInfo = response.data } finally { this.loading = false } } }}</script>
<style scoped>.section-card { margin-top:16px; }.card-header { display:flex; align-items:center; justify-content:space-between; }</style>
