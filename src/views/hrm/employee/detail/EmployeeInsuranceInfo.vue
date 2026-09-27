<template><el-card
  v-loading="loading"
  shadow="never"
  class="section-card"
><div
  slot="header"
  class="card-header"
><span>社保资料</span><el-button
  v-hasPermi="['hrm:insurance:employee-info:update']"
  type="primary"
  plain
  icon="el-icon-edit"
  @click="openForm"
>编辑</el-button></div><el-descriptions
  :column="3"
  border
><el-descriptions-item label="社保编号">{{ insuranceInfo && insuranceInfo.socialSecurityNumber || '-' }}</el-descriptions-item><el-descriptions-item label="公积金编号">{{ insuranceInfo && insuranceInfo.accumulationFundNumber || '-' }}</el-descriptions-item><el-descriptions-item label="社保起始月">{{ formatHrmMonth(insuranceInfo && insuranceInfo.socialSecurityStartMonth) }}</el-descriptions-item><el-descriptions-item label="参保方案">{{ insuranceInfo && (insuranceInfo.schemeName || insuranceInfo.schemeId) || '-' }}</el-descriptions-item><el-descriptions-item label="本地首次缴纳社保">{{ formatHrmYesNo(insuranceInfo && insuranceInfo.firstSocialSecurity) }}</el-descriptions-item><el-descriptions-item label="本地首次缴纳公积金">{{ formatHrmYesNo(insuranceInfo && insuranceInfo.firstAccumulationFund) }}</el-descriptions-item></el-descriptions><employee-insurance-info-form
  ref="form"
  @success="getInsuranceInfo"
/></el-card></template>
<script>import { getInsuranceEmployeeInfo } from '@/api/hrm/insurance/employee-info'; import { formatHrmMonth, formatHrmYesNo } from '@/views/hrm/utils/format'; import EmployeeInsuranceInfoForm from './EmployeeInsuranceInfoForm.vue'; export default { name: 'HrmEmployeeInsuranceInfo', components: { EmployeeInsuranceInfoForm }, props: { employeeId: { type: Number, required: true }}, data() { return { loading: true, insuranceInfo: undefined } }, created() { this.getInsuranceInfo() }, methods: { formatHrmMonth, formatHrmYesNo, async getInsuranceInfo() { this.loading = true; try { const response = await getInsuranceEmployeeInfo(this.employeeId); this.insuranceInfo = response.data } finally { this.loading = false } }, openForm() { this.$refs.form.open(this.employeeId) } }}</script>
<style scoped>.section-card { margin-bottom:16px; }.card-header { display:flex; align-items:center; justify-content:space-between; }</style>
