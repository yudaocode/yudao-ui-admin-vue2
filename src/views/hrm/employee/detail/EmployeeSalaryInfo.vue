<template><el-card
  v-loading="loading"
  shadow="never"
  class="section-card"
><div slot="header">当前薪资档案</div><el-descriptions
  v-if="salaryInfo"
  :column="3"
  border
><el-descriptions-item label="转正工资">{{ formatHrmMoney(salaryInfo.regularSalary) }}</el-descriptions-item><el-descriptions-item label="试用工资">{{ formatHrmMoney(salaryInfo.probationSalary) }}</el-descriptions-item><el-descriptions-item label="调整日期">{{ formatHrmDate(salaryInfo.effectTime) }}</el-descriptions-item><el-descriptions-item label="调整类型"><dict-tag
  v-if="salaryInfo.changeType != null"
  :type="DICT_TYPE.HRM_SALARY_CHANGE_TYPE"
  :value="salaryInfo.changeType"
/><span v-else>-</span></el-descriptions-item><el-descriptions-item label="调整原因"><dict-tag
  v-if="salaryInfo.changeReason != null"
  :type="DICT_TYPE.HRM_SALARY_CHANGE_REASON"
  :value="salaryInfo.changeReason"
/><span v-else>-</span></el-descriptions-item><el-descriptions-item label="备注">{{ salaryInfo.remark || '-' }}</el-descriptions-item></el-descriptions><el-empty
  v-else
  description="暂无薪资档案"
/></el-card></template>
<script>import { DICT_TYPE } from '@/utils/dict'; import { getSalaryEmployeeInfo } from '@/api/hrm/salary/employee-info'; import { formatHrmDate, formatHrmMoney } from '@/views/hrm/utils/format'; export default { name: 'HrmEmployeeSalaryInfo', props: { employeeId: { type: Number, required: true }}, data() { return { DICT_TYPE, loading: true, salaryInfo: undefined } }, created() { this.getSalaryInfo() }, methods: { formatHrmDate, formatHrmMoney, async getSalaryInfo() { this.loading = true; try { const response = await getSalaryEmployeeInfo(this.employeeId); this.salaryInfo = response.data } finally { this.loading = false } } }}</script>
<style scoped>.section-card { margin-bottom:16px; }</style>
