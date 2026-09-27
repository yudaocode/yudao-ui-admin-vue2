<template>
  <el-dialog
    title="办理转正"
    :visible.sync="dialogVisible"
    width="760px"
    append-to-body
  >
    <el-descriptions
      :column="2"
      border
      class="summary"
    ><el-descriptions-item label="员工姓名">{{ employee && employee.name || '-' }}</el-descriptions-item><el-descriptions-item label="当前岗位">{{ employee && employee.postName || '-' }}</el-descriptions-item></el-descriptions>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="112px"
    >
      <el-row :gutter="18"><el-col :span="12"><el-form-item
        label="异动原因"
        prop="reason"
      ><el-select
        v-model="formData.reason"
        class="full-width"
      ><el-option
        v-for="item in changeReasonOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      /></el-select></el-form-item></el-col><el-col :span="12"><el-form-item
        label="生效日期"
        prop="effectTime"
      ><el-date-picker
        v-model="formData.effectTime"
        class="full-width"
        type="date"
        value-format="timestamp"
      /></el-form-item></el-col></el-row>
      <el-row :gutter="18"><el-col :span="12"><el-form-item
        label="转正后部门"
        prop="newDeptId"
      ><dept-select v-model="formData.newDeptId" /></el-form-item></el-col><el-col :span="12"><el-form-item
        label="转正后岗位"
        prop="newPostName"
      ><el-input
        v-model="formData.newPostName"
        maxlength="255"
        placeholder="未调整则保持当前岗位"
      /></el-form-item></el-col></el-row>
      <el-row :gutter="18"><el-col :span="12"><el-form-item
        label="转正后职级"
        prop="newPostLevel"
      ><el-input
        v-model="formData.newPostLevel"
        maxlength="255"
        placeholder="未调整则保持当前职级"
      /></el-form-item></el-col><el-col :span="12"><el-form-item
        label="转正后上级"
        prop="newLeaderEmployeeId"
      ><hrm-employee-select
        v-model="formData.newLeaderEmployeeId"
        :disabled-ids="formData.employeeId ? [formData.employeeId] : []"
        placeholder="未调整则保持当前直属上级"
      /></el-form-item></el-col></el-row>
      <el-form-item
        label="转正后工作地点"
        prop="newWorkAddress"
      ><el-input
        v-model="formData.newWorkAddress"
        maxlength="255"
        placeholder="未调整则保持当前工作地点"
      /></el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        :rows="3"
        maxlength="500"
        show-word-limit
        type="textarea"
      /></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :loading="formLoading"
      @click="submitForm"
    >确认转正</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>
<script>
import { regularEmployee } from '@/api/hrm/employee'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import HrmEmployeeSelect from './components/HrmEmployeeSelect.vue'
import { HrmEmployeeChangeReason, HrmEmployeeChangeReasonOptions } from '@/views/hrm/utils/constants'
export default {
  name: 'HrmEmployeeRegularForm', components: { DeptSelect, HrmEmployeeSelect },
  data() { return { dialogVisible: false, formLoading: false, employee: undefined, formData: {}, changeReasonOptions: HrmEmployeeChangeReasonOptions, formRules: { reason: [{ required: true, message: '请选择异动原因', trigger: 'change' }], effectTime: [{ required: true, message: '请选择生效日期', trigger: 'change' }] }} },
  methods: {
    open(row) { this.dialogVisible = true; this.employee = row; const date = new Date(); date.setHours(0, 0, 0, 0); this.formData = { employeeId: row.id, reason: HrmEmployeeChangeReason.ORGANIZATION_ADJUSTMENT, newDeptId: row.deptId, newPostName: row.postName, newPostLevel: row.postLevel, newWorkAddress: row.workAddress, newLeaderEmployeeId: row.leaderEmployeeId, effectTime: date.getTime() }; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await regularEmployee(this.formData); this.$modal.msgSuccess('转正办理成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }
  }
}
</script>
<style scoped>.summary { margin-bottom: 18px; }.full-width { width: 100%; }</style>
