<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body title="整理凭证" width="500px">
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="88px">
      <el-form-item label="整理范围" prop="month">
        <el-date-picker v-model="formData.month" :clearable="false" placeholder="请选择月份" type="month" value-format="yyyy-MM" style="width: 100%" />
      </el-form-item>
      <el-form-item label="凭证字" prop="voucherWordId">
        <fms-voucher-word-select v-model="formData.voucherWordId" :options="voucherWords" style="width: 100%" />
      </el-form-item>
      <el-form-item label="起始编号" prop="startNumber">
        <el-input-number v-model="formData.startNumber" :controls="false" :min="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label-width="20px" prop="type">
        <el-radio-group v-model="formData.type" class="tidy-options">
          <el-radio :label="FMS_VOUCHER_TIDY_TYPE.FILL_GAPS">按凭证号顺次前移补齐断号</el-radio>
          <el-radio :label="FMS_VOUCHER_TIDY_TYPE.REORDER_BY_TIME">按凭证日期重新顺次编号</el-radio>
        </el-radio-group>
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
import { FMS_VOUCHER_TIDY_TYPE } from '../helpers'

export default {
  name: 'FmsVoucherTidyForm',
  components: { FmsVoucherWordSelect },
  data() {
    return {
      FMS_VOUCHER_TIDY_TYPE,
      dialogVisible: false,
      formLoading: false,
      voucherWords: [],
      formData: this.createDefault(),
      formRules: {
        month: [{ required: true, message: '请选择整理范围', trigger: 'change' }],
        voucherWordId: [{ required: true, message: '请选择凭证字', trigger: 'change' }],
        startNumber: [{ required: true, message: '请输入起始编号', trigger: 'blur' }],
        type: [{ required: true, message: '请选择整理方式', trigger: 'change' }]
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
        startNumber: 1,
        type: FMS_VOUCHER_TIDY_TYPE.FILL_GAPS
      }
    },
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        FmsVoucherApi.tidyVoucher(this.formData).then(() => {
          this.$modal.msgSuccess('整理成功')
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
.tidy-options { display: flex; flex-direction: column; align-items: flex-start; }
.tidy-options .el-radio { margin: 6px 0; }
</style>
