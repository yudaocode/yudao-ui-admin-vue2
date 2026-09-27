<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-form-item label="工资项分类" prop="parentCode">
        <el-select
          v-model="formData.parentCode"
          disabled
          class="full-width"
          placeholder="请选择工资项分类"
        >
          <el-option
            v-for="option in categoryList"
            :key="option.code"
            :label="option.name"
            :value="option.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="工资项名称" prop="name">
        <el-input v-model="formData.name" maxlength="64" placeholder="请输入工资项名称" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          maxlength="255"
          placeholder="请输入备注"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createSalaryOption, getSalaryOptionList } from '@/api/hrm/salary/config/option'
import { HrmSalaryOptionCategoryCode } from '@/views/hrm/utils/constants'

function createDefaultFormData() {
  return { parentCode: undefined, name: '', remark: '' }
}

export default {
  name: 'HrmSalaryOptionForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      optionList: [],
      formData: createDefaultFormData(),
      formRules: {
        parentCode: [{ required: true, message: '工资项分类不能为空', trigger: 'change' }],
        name: [{ required: true, message: '工资项名称不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    categoryList() {
      return this.optionList.filter(item =>
        item.parentCode === HrmSalaryOptionCategoryCode.ROOT && !item.systemFlag && item.enabled
      )
    }
  },
  methods: {
    async open(parentCode) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.create')
      this.resetForm()
      this.formData.parentCode = parentCode
      this.formLoading = true
      try {
        const response = await getSalaryOptionList()
        this.optionList = response.data
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        await createSalaryOption(this.formData)
        this.$modal.msgSuccess(this.$t('common.createSuccess'))
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
