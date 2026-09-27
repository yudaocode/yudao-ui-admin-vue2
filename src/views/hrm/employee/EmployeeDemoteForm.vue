<template><employee-position-change-form
  ref="form"
  title="办理降级"
  :change-type="HrmEmployeeChangeType.DEMOTION"
  :submit-request="demoteEmployee"
  @success="$emit('success')"
/></template>
<script>
import { demoteEmployee } from '@/api/hrm/employee'
import { HrmEmployeeChangeType } from '@/views/hrm/utils/constants'
import EmployeePositionChangeForm from './EmployeePositionChangeForm.vue'
export default { name: 'HrmEmployeeDemoteForm', components: { EmployeePositionChangeForm }, data() { return { HrmEmployeeChangeType, demoteEmployee } }, methods: { open(employee) { this.$refs.form.open(employee) } }}
</script>
