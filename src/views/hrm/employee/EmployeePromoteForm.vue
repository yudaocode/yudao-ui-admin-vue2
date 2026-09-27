<template><employee-position-change-form
  ref="form"
  title="办理晋升"
  :change-type="HrmEmployeeChangeType.PROMOTION"
  :submit-request="promoteEmployee"
  @success="$emit('success')"
/></template>
<script>
import { promoteEmployee } from '@/api/hrm/employee'
import { HrmEmployeeChangeType } from '@/views/hrm/utils/constants'
import EmployeePositionChangeForm from './EmployeePositionChangeForm.vue'
export default { name: 'HrmEmployeePromoteForm', components: { EmployeePositionChangeForm }, data() { return { HrmEmployeeChangeType, promoteEmployee } }, methods: { open(employee) { this.$refs.form.open(employee) } }}
</script>
