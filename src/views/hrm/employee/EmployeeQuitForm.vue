<template>
  <el-dialog
    :title="employee && employee.entryStatus === HrmEmployeeEntryStatus.LEFT ? '修改离职信息' : '办理离职'"
    :visible.sync="dialogVisible"
    width="680px"
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
        label="计划离职时间"
        prop="planQuitTime"
      ><el-date-picker
        v-model="formData.planQuitTime"
        class="full-width"
        type="datetime"
        value-format="timestamp"
      /></el-form-item></el-col><el-col :span="12"><el-form-item
        label="申请离职日期"
        prop="applyQuitTime"
      ><el-date-picker
        v-model="formData.applyQuitTime"
        class="full-width"
        type="date"
        value-format="timestamp"
      /></el-form-item></el-col></el-row>
      <el-row :gutter="18"><el-col :span="12"><el-form-item
        label="离职类型"
        prop="type"
      ><el-select
        v-model="formData.type"
        class="full-width"
        @change="handleQuitTypeChange"
      ><el-option
        v-for="item in quitTypeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      /></el-select></el-form-item></el-col><el-col
        v-if="formData.type !== HrmEmployeeQuitType.RETIREMENT"
        :span="12"
      ><el-form-item
        label="离职原因"
        prop="reason"
      ><el-select
        v-model="formData.reason"
        class="full-width"
        clearable
      ><el-option
        v-for="item in filteredQuitReasonOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      /></el-select></el-form-item></el-col></el-row>
      <el-form-item
        label="薪资结算日期"
        prop="salarySettlementTime"
      ><el-date-picker
        v-model="formData.salarySettlementTime"
        type="date"
        value-format="timestamp"
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
    >保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>
<script>
import { quitEmployee } from '@/api/hrm/employee'
import { getEmployeeQuitInfo } from '@/api/hrm/employee/quit-info'
import { HrmEmployeeQuitReason, HrmEmployeeQuitReasonOptions, HrmEmployeeQuitType, HrmEmployeeQuitTypeOptions, HrmEmployeeEntryStatus } from '@/views/hrm/utils/constants'
const dayValue = value => { const date = new Date(value); return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() }
export default {
  name: 'HrmEmployeeQuitForm',
  data() {
    return {
      HrmEmployeeQuitType, HrmEmployeeEntryStatus, dialogVisible: false, formLoading: false, formData: {}, employee: undefined,
      quitTypeOptions: HrmEmployeeQuitTypeOptions,
      formRules: {
        planQuitTime: [{ required: true, message: '请选择计划离职时间', trigger: 'change' }, { validator: (rule, value, callback) => { if (value && this.formData.applyQuitTime && dayValue(value) < dayValue(this.formData.applyQuitTime)) return callback(new Error('计划离职日期不能早于申请离职日期')); callback() }, trigger: 'change' }],
        applyQuitTime: [{ required: true, message: '请选择申请离职日期', trigger: 'change' }],
        salarySettlementTime: [{ required: true, message: '请选择薪资结算日期', trigger: 'change' }, { validator: (rule, value, callback) => { if (value && this.formData.planQuitTime && dayValue(value) < dayValue(this.formData.planQuitTime)) return callback(new Error('薪资结算日期不能早于计划离职日期')); callback() }, trigger: 'change' }],
        type: [{ required: true, message: '请选择离职类型', trigger: 'change' }],
        reason: [{ validator: (rule, value, callback) => { if (this.formData.type !== HrmEmployeeQuitType.RETIREMENT && !value) return callback(new Error('请选择离职原因')); callback() }, trigger: 'change' }]
      }
    }
  },
  computed: { filteredQuitReasonOptions() { return HrmEmployeeQuitReasonOptions.filter(item => item.quitType === this.formData.type) } },
  methods: {
    async open(row) {
      this.dialogVisible = true; this.employee = row; this.resetForm(row.id)
      if (!row.id) return
      this.formLoading = true
      try { const response = await getEmployeeQuitInfo(row.id); if (response.data) this.formData = Object.assign({}, this.formData, response.data, { employeeId: row.id }) } finally { this.formLoading = false }
    },
    handleQuitTypeChange(type) { const item = HrmEmployeeQuitReasonOptions.find(option => option.quitType === type); this.formData.reason = item && item.value },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await quitEmployee(this.formData); this.$modal.msgSuccess('离职信息保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    resetForm(employeeId) { const now = new Date(); now.setHours(0, 0, 0, 0); this.formData = { employeeId, applyQuitTime: now.getTime(), type: HrmEmployeeQuitType.VOLUNTARY, reason: HrmEmployeeQuitReason.FAMILY }; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) }
  }
}
</script>
<style scoped>.summary { margin-bottom: 18px; }.full-width { width: 100%; }</style>
