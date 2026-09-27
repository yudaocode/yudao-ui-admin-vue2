<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body title="移动凭证" width="480px">
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="88px">
      <el-form-item label="期间" prop="month">
        <el-date-picker v-model="formData.month" :clearable="false" placeholder="请选择期间" type="month" value-format="yyyy-MM" style="width: 100%" />
      </el-form-item>
      <el-form-item label="凭证字" prop="voucherWordId">
        <fms-voucher-word-select v-model="formData.voucherWordId" :options="voucherWords" style="width: 100%" />
      </el-form-item>
      <el-form-item label="移动规则" prop="sourceNumber">
        <div class="move-rule">
          <span>将上述期间的：</span>
          <el-input-number v-model="formData.sourceNumber" :controls="false" :min="1" @blur="$refs.form && $refs.form.validateField('sourceNumber')" />
          <span>号移动到：</span>
          <el-input-number v-model="formData.targetNumber" :controls="false" :min="1" />
          <span>号之前</span>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsVoucherApi } from '@/api/fms/voucher'
import FmsVoucherWordSelect from '@/views/fms/config/voucher-word/components/FmsVoucherWordSelect.vue'

export default {
  name: 'FmsVoucherMoveForm',
  components: { FmsVoucherWordSelect },
  data() {
    const validateRule = (rule, value, callback) => {
      if (!value || !this.formData.targetNumber) callback(new Error('请输入完整的移动规则'))
      else if (this.formData.targetNumber >= value) callback(new Error('移动到的凭证号必须小于原凭证号'))
      else callback()
    }
    return {
      dialogVisible: false,
      formLoading: false,
      voucherWords: [],
      formData: this.createDefault(),
      formRules: {
        month: [{ required: true, message: '请选择期间', trigger: 'change' }],
        voucherWordId: [{ required: true, message: '请选择凭证字', trigger: 'change' }],
        sourceNumber: [{ validator: validateRule, trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(accountSetId, defaultMonth, words) {
      this.dialogVisible = true
      this.voucherWords = words
      this.formData = this.createDefault(accountSetId, defaultMonth, this.voucherWords)
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    createDefault(accountSetId, month, words) {
      const options = words || []
      const preferred = options.find(item => item.defaultStatus) || options[0]
      return {
        accountSetId: Number(accountSetId) || 0,
        month: month || '',
        voucherWordId: preferred && preferred.id,
        sourceNumber: undefined,
        targetNumber: undefined
      }
    },
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        FmsVoucherApi.moveVoucher(this.formData).then(() => {
          this.$modal.msgSuccess('移动成功')
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
.move-rule { display: flex; align-items: center; white-space: nowrap; }
.move-rule .el-input-number { width: 62px; margin: 0 5px; }
</style>
