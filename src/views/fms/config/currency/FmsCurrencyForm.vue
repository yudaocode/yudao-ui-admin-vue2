<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="币别编码" prop="code">
        <el-input v-model="formData.code" :disabled="standardCurrency" maxlength="64" placeholder="请输入币别编码，如 USD" @blur="formData.code = (formData.code || '').toUpperCase()" />
      </el-form-item>
      <el-form-item label="币别名称" prop="name">
        <el-input v-model="formData.name" maxlength="255" placeholder="请输入币别名称" />
      </el-form-item>
      <el-form-item label="汇率" prop="exchangeRate">
        <el-input-number v-model="formData.exchangeRate" :disabled="standardCurrency" :min="0.000001" :max="999999999999.999999" :precision="6" :step="0.01" controls-position="right" style="width: 100%" />
        <div class="form-tip">{{ standardCurrency ? '本位币汇率固定为 1' : '按 1 单位外币折算本位币填写' }}</div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsCurrencyApi } from '@/api/fms/config/currency'

export default {
  name: 'FmsCurrencyForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      standardCurrency: false,
      formData: this.defaultForm(),
      formRules: {
        code: [
          { required: true, message: '币别编码不能为空', trigger: 'blur' },
          { pattern: /^[A-Za-z][A-Za-z0-9_]*$/, message: '币别编码必须以字母开头，只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        name: [{ required: true, message: '币别名称不能为空', trigger: 'blur' }],
        exchangeRate: [{ required: true, message: '汇率不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm(accountSetId) {
      return { id: undefined, accountSetId: accountSetId || 0, code: '', name: '', exchangeRate: 1, standard: false }
    },
    open(type, accountSetId, row) {
      this.formType = type
      this.dialogTitle = type === 'update' ? '编辑币别' : '新增币别'
      this.dialogVisible = true
      this.formData = Object.assign(this.defaultForm(accountSetId), row || {})
      this.standardCurrency = !!(row && row.standard)
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        this.formData.code = (this.formData.code || '').toUpperCase()
        const request = this.formType === 'create'
          ? FmsCurrencyApi.createCurrency(this.formData)
          : FmsCurrencyApi.updateCurrency(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    }
  }
}
</script>

<style scoped>
.form-tip { color: #909399; font-size: 12px; line-height: 24px; }
</style>
