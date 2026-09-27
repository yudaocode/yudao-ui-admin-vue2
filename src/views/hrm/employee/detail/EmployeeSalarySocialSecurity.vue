<template><div><employee-salary-info
  v-if="checkPermi(['hrm:salary:employee-info:query'])"
  :employee-id="employeeId"
/><employee-salary-card-info :employee-id="employeeId" /><employee-insurance-info
  v-if="checkPermi(['hrm:insurance:employee-info:query'])"
  :employee-id="employeeId"
/><employee-salary-history-list
  v-if="checkPermi(['hrm:salary:month-record:query'])"
  :employee-id="employeeId"
/><employee-salary-change-record-list :employee-id="employeeId" /></div></template>
<script>import { checkPermi } from '@/utils/permission'; import EmployeeSalaryInfo from './EmployeeSalaryInfo.vue'; import EmployeeSalaryCardInfo from './EmployeeSalaryCardInfo.vue'; import EmployeeSalaryChangeRecordList from './EmployeeSalaryChangeRecordList.vue'; import EmployeeSalaryHistoryList from './EmployeeSalaryHistoryList.vue'; import EmployeeInsuranceInfo from './EmployeeInsuranceInfo.vue'; export default { name: 'HrmEmployeeSalarySocialSecurity', components: { EmployeeSalaryInfo, EmployeeSalaryCardInfo, EmployeeSalaryChangeRecordList, EmployeeSalaryHistoryList, EmployeeInsuranceInfo }, props: { employeeId: { type: Number, required: true }}, methods: { checkPermi }}</script>
