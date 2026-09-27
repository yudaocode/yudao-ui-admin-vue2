<template><employee-position-change-form
  ref="form"
  title="调整部门/岗位"
  :change-type="HrmEmployeeChangeType.TRANSFER"
  :submit-request="transferEmployee"
  @success="$emit('success')"
/></template>
<script>
import { transferEmployee } from '@/api/hrm/employee'
import { HrmEmployeeChangeType } from '@/views/hrm/utils/constants'
import EmployeePositionChangeForm from './EmployeePositionChangeForm.vue'
export default { name: 'HrmEmployeeTransferForm', components: { EmployeePositionChangeForm }, data() { return { HrmEmployeeChangeType, transferEmployee } }, methods: { open(employee) { this.$refs.form.open(employee) } }}
</script>
