<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="760px"
    append-to-body
  >
    <el-descriptions
      :column="2"
      border
      class="summary"
    >
      <el-descriptions-item label="员工姓名">{{ employee && employee.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="当前岗位">{{ employee && employee.postName || '-' }}</el-descriptions-item>
    </el-descriptions>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="112px"
    >
      <el-row :gutter="18">
        <el-col :span="12"><el-form-item
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
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="生效日期"
          prop="effectTime"
        ><el-date-picker
          v-model="formData.effectTime"
          class="full-width"
          type="date"
          value-format="timestamp"
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="18">
        <el-col :span="12"><el-form-item
          label="新部门"
          prop="newDeptId"
        ><dept-select v-model="formData.newDeptId" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="新岗位"
          prop="newPostName"
        ><el-input
          v-model="formData.newPostName"
          maxlength="255"
          placeholder="请输入新岗位"
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="18">
        <el-col :span="12"><el-form-item
          label="新职级"
          prop="newPostLevel"
        ><el-input
          v-model="formData.newPostLevel"
          maxlength="255"
          placeholder="请输入新职级"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="新直属上级"
          prop="newLeaderEmployeeId"
        ><hrm-employee-select
          v-model="formData.newLeaderEmployeeId"
          :disabled-ids="formData.employeeId ? [formData.employeeId] : []"
          placeholder="请选择新直属上级"
        /></el-form-item></el-col>
      </el-row>
      <el-form-item
        label="新工作地点"
        prop="newWorkAddress"
      ><el-input
        v-model="formData.newWorkAddress"
        maxlength="255"
        placeholder="请输入新工作地点"
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
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import HrmEmployeeSelect from './components/HrmEmployeeSelect.vue'
import { HrmEmployeeChangeReason, HrmEmployeeChangeReasonOptions, HrmEmployeeChangeType } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmEmployeePositionChangeForm',
  components: { DeptSelect, HrmEmployeeSelect },
  props: {
    title: { type: String, required: true },
    changeType: { type: Number, required: true },
    submitRequest: { type: Function, required: true }
  },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: {},
      employee: undefined,
      formRules: {
        reason: [{ required: true, message: '请选择异动原因', trigger: 'change' }],
        effectTime: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
      }
    }
  },
  computed: {
    changeReasonOptions() {
      return HrmEmployeeChangeReasonOptions.filter(item => this.changeType === HrmEmployeeChangeType.DEMOTION
        ? item.value >= HrmEmployeeChangeReason.VIOLATION
        : item.value <= HrmEmployeeChangeReason.WORK_ARRANGEMENT)
    }
  },
  methods: {
    open(row) { this.dialogVisible = true; this.employee = row; this.resetForm(row) },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        await this.submitRequest(this.formData)
        this.$modal.msgSuccess(this.title + '成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally { this.formLoading = false }
    },
    resetForm(row) {
      const effectTime = new Date(); effectTime.setHours(0, 0, 0, 0)
      this.formData = {
        employeeId: row.id,
        reason: this.changeType === HrmEmployeeChangeType.DEMOTION ? HrmEmployeeChangeReason.VIOLATION : HrmEmployeeChangeReason.ORGANIZATION_ADJUSTMENT,
        newDeptId: row.deptId,
        newPostName: row.postName,
        newPostLevel: row.postLevel,
        newWorkAddress: row.workAddress,
        newLeaderEmployeeId: row.leaderEmployeeId,
        effectTime: effectTime.getTime()
      }
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    }
  }
}
</script>

<style scoped>.summary { margin-bottom: 18px; }.full-width { width: 100%; }</style>
