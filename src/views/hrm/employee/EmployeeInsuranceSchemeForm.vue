<template>
  <el-dialog
    title="设置参保方案"
    :visible.sync="dialogVisible"
    width="520px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="92px"
    >
      <el-form-item label="员工数量">{{ employeeIds.length }} 人</el-form-item>
      <el-form-item
        label="社保方案"
        prop="schemeId"
      ><insurance-scheme-select
        v-model="formData.schemeId"
        placeholder="请选择社保方案"
      /></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      :disabled="formLoading"
      type="primary"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>
<script>
import { updateEmployeeScheme } from '@/api/hrm/insurance/employee-info'
import InsuranceSchemeSelect from '@/views/hrm/insurance/scheme/components/InsuranceSchemeSelect.vue'
import { executeHrmBatch } from '@/views/hrm/utils/batch'
export default {
  name: 'HrmEmployeeInsuranceSchemeForm', components: { InsuranceSchemeSelect },
  data() { return { dialogVisible: false, formLoading: false, employeeIds: [], formData: { schemeId: undefined }, formRules: { schemeId: [{ required: true, message: '社保方案不能为空', trigger: 'change' }] }} },
  methods: {
    open(ids) { this.dialogVisible = true; this.employeeIds = [...ids]; this.formData.schemeId = undefined; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { const success = await executeHrmBatch(this, this.employeeIds.map(id => updateEmployeeScheme(id, this.formData.schemeId))); if (success) { this.dialogVisible = false; this.$emit('success') } } finally { this.formLoading = false } }
  }
}
</script>
