<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="720px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="formData.name" maxlength="64" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="默认模板" prop="defaultStatus">
        <el-switch v-model="formData.defaultStatus" />
      </el-form-item>
      <el-form-item label="调薪项" prop="options">
        <salary-change-option-select ref="optionSelect" v-model="formData.options" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  createSalaryChangeTemplate,
  getSalaryChangeTemplate,
  updateSalaryChangeTemplate
} from '@/api/hrm/salary/config/change-template'
import SalaryChangeOptionSelect from '../option/components/SalaryChangeOptionSelect.vue'

function createDefaultFormData() {
  return { name: '', defaultStatus: false, options: [] }
}

export default {
  name: 'HrmSalaryChangeTemplateForm',
  components: { SalaryChangeOptionSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      if (!id) {
        this.resetForm()
      } else {
        this.formLoading = true
        try {
          const response = await getSalaryChangeTemplate(id)
          this.formData = response.data
          this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        } finally {
          this.formLoading = false
        }
      }
      await this.$nextTick()
      await this.$refs.optionSelect.init(type === 'create')
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createSalaryChangeTemplate(this.formData)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await updateSalaryChangeTemplate(this.formData)
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
