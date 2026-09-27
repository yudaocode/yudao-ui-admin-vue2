<template><div><employee-details-info :employee="employee" /><el-card
  shadow="never"
  class="section-card"
><div slot="header">教育经历</div><employee-education-experience-list :employee-id="employeeId" /></el-card><el-card
  shadow="never"
  class="section-card"
><div slot="header">工作经历</div><employee-work-experience-list :employee-id="employeeId" /></el-card><el-card
  shadow="never"
  class="section-card"
><div slot="header">证书/证件</div><employee-certificate-list :employee-id="employeeId" /></el-card><el-card
  shadow="never"
  class="section-card"
><div slot="header">培训经历</div><employee-training-experience-list :employee-id="employeeId" /></el-card><el-card
  shadow="never"
  class="section-card"
><div slot="header">联系人</div><employee-contact-list :employee-id="employeeId" /></el-card></div></template>
<script>
import EmployeeCertificateList from './EmployeeCertificateList.vue'; import EmployeeContactList from './EmployeeContactList.vue'; import EmployeeDetailsInfo from './EmployeeDetailsInfo.vue'; import EmployeeEducationExperienceList from './EmployeeEducationExperienceList.vue'; import EmployeeTrainingExperienceList from './EmployeeTrainingExperienceList.vue'; import EmployeeWorkExperienceList from './EmployeeWorkExperienceList.vue'
export default { name: 'HrmEmployeeBasicInfo', components: { EmployeeCertificateList, EmployeeContactList, EmployeeDetailsInfo, EmployeeEducationExperienceList, EmployeeTrainingExperienceList, EmployeeWorkExperienceList }, props: { employee: { type: Object, required: true }, employeeId: { type: Number, required: true }}}
</script>
<style scoped>.section-card { margin-top: 16px; }</style>
