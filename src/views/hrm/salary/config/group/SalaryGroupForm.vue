<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="860px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="104px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="薪资组" prop="name">
            <el-input v-model="formData.name" maxlength="64" placeholder="请输入薪资组名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计税规则" prop="taxRuleId">
            <salary-tax-rule-select v-model="formData.taxRuleId" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计薪标准"><span>21.75 天 / 月</span></el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调薪规则">
            <span>按转正、调薪生效日前后的工资混合计算</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="部门范围" prop="deptIds">
            <dept-select
              v-model="formData.deptIds"
              multiple
              placeholder="请选择部门"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="员工范围" prop="employeeIds">
            <hrm-employee-select
              v-model="formData.employeeIds"
              class="full-width"
              multiple
              placeholder="请选择员工"
              title="选择薪资组员工"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  createSalaryGroup,
  getSalaryGroup,
  updateSalaryGroup
} from '@/api/hrm/salary/config/group'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import SalaryTaxRuleSelect from '../tax-rule/components/SalaryTaxRuleSelect.vue'

function createDefaultFormData() {
  return { id: undefined, name: '', taxRuleId: undefined, deptIds: [], employeeIds: [] }
}

export default {
  name: 'HrmSalaryGroupForm',
  components: { HrmEmployeeSelect, DeptSelect, SalaryTaxRuleSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '薪资组名称不能为空', trigger: 'blur' }],
        taxRuleId: [{ required: true, message: '计税规则不能为空', trigger: 'change' }],
        employeeIds: [{ validator: this.validateSalaryGroupScope, trigger: 'change' }]
      }
    }
  },
  methods: {
    validateSalaryGroupScope(rule, value, callback) {
      if (this.formData.deptIds.length || this.formData.employeeIds.length) {
        callback()
        return
      }
      callback(new Error('适用部门和适用员工不能同时为空'))
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      if (!id) {
        this.resetForm()
        return
      }
      this.formLoading = true
      try {
        const response = await getSalaryGroup(id)
        this.formData = response.data
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createSalaryGroup(this.formData)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await updateSalaryGroup(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
