<template>
  <el-dialog
    title="添加参保人员"
    :visible.sync="dialogVisible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="76px"
    >
      <el-form-item
        label="员工"
        prop="employeeIds"
      >
        <hrm-employee-select
          v-model="formData.employeeIds"
          multiple
          placeholder="请选择员工"
          :selectable="isEmployeeSelectable"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  createInsuranceMonthEmployeeRecordList,
  getUninsuredEmployeeList
} from '@/api/hrm/insurance/month-record/employee'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'

export default {
  name: 'HrmInsuranceAddEmployeeForm',
  components: { HrmEmployeeSelect },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      monthRecordId: undefined,
      formData: { employeeIds: [] },
      selectableEmployeeIds: new Set(),
      formRules: {
        employeeIds: [{ required: true, message: '请选择员工', trigger: 'change' }]
      }
    }
  },
  methods: {
    async open(recordId) {
      this.dialogVisible = true
      this.monthRecordId = recordId
      this.formData.employeeIds = []
      this.formLoading = true
      try {
        const response = await getUninsuredEmployeeList(recordId)
        this.selectableEmployeeIds = new Set(
          response.data.map(employee => employee.id).filter(id => id !== undefined)
        )
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid || !this.monthRecordId) return
      this.formLoading = true
      try {
        await createInsuranceMonthEmployeeRecordList({
          monthRecordId: this.monthRecordId,
          employeeIds: this.formData.employeeIds
        })
        this.$modal.msgSuccess(this.$t('common.createSuccess'))
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    isEmployeeSelectable(employee) {
      return employee.id !== undefined && this.selectableEmployeeIds.has(employee.id)
    }
  }
}
</script>
