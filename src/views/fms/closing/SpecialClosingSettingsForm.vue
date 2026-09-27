<template>
  <el-dialog :title="'编辑' + schemeName" :visible.sync="dialogVisible" width="880px" append-to-body>
    <el-form ref="form" :model="formData" :rules="formRules" label-width="90px">
      <el-form-item label="凭证字" prop="voucherWordId">
        <FmsVoucherWordSelect v-model="formData.voucherWordId" :options="voucherWords" class="word-select" />
      </el-form-item>
    </el-form>

    <div class="rules-header">
      <span>凭证分录规则</span>
      <el-button type="text" icon="el-icon-plus" @click="addSubjectRule()">添加分录</el-button>
    </div>
    <el-table :data="formData.subjects" border max-height="420px">
      <el-table-column label="摘要" min-width="180">
        <template slot-scope="scope"><el-input v-model="scope.row.digest" placeholder="请输入摘要" /></template>
      </el-table-column>
      <el-table-column label="借/贷" width="105">
        <template slot-scope="scope">
          <el-select v-model="scope.row.direction">
            <el-option label="借" :value="FMS_DEBIT_CREDIT_DIRECTION.DEBIT" />
            <el-option label="贷" :value="FMS_DEBIT_CREDIT_DIRECTION.CREDIT" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="科目" min-width="280">
        <template slot-scope="scope"><FmsSubjectSelect v-model="scope.row.subjectId" :options="subjects" class="full-width" /></template>
      </el-table-column>
      <el-table-column label="金额比例%" width="130">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.amountRatio" :min="0.01" :max="100" :controls="false" :precision="2" class="full-width" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" align="center">
        <template slot-scope="scope">
          <el-button type="text" class="danger-text" @click="formData.subjects.splice(scope.$index, 1)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="form-tip">{{ ratioTip }}</div>

    <div slot="footer">
      <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsClosingSchemeApi } from '@/api/fms/closing/scheme'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'
import FmsVoucherWordSelect from '@/views/fms/config/voucher-word/components/FmsVoucherWordSelect.vue'
import { FMS_CLOSING_TYPE, FMS_DEBIT_CREDIT_DIRECTION } from '@/views/fms/utils/constants'

export default {
  name: 'FmsSpecialClosingSettingsForm',
  components: { FmsSubjectSelect, FmsVoucherWordSelect },
  props: {
    accountSetId: { type: Number, required: true },
    subjects: { type: Array, required: true },
    voucherWords: { type: Array, required: true }
  },
  data() {
    return {
      FMS_DEBIT_CREDIT_DIRECTION,
      dialogVisible: false,
      submitting: false,
      schemeName: '专用结转',
      schemeType: FMS_CLOSING_TYPE.UNPAID_VAT,
      formData: { id: 0, accountSetId: this.accountSetId, voucherWordId: undefined, subjects: [] },
      formRules: {
        voucherWordId: [{ required: true, message: '凭证字不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    ratioTip() {
      return this.schemeType === FMS_CLOSING_TYPE.UNPAID_VAT
        ? '转出未交增值税的借方和贷方比例必须分别等于 100%'
        : '借方和贷方比例必须相等，该比例同时作为本方案的计提税率'
    }
  },
  methods: {
    open(scheme) {
      this.schemeName = scheme.name
      this.schemeType = scheme.type
      this.formData = {
        id: scheme.id,
        accountSetId: this.accountSetId,
        voucherWordId: scheme.voucherWordId,
        subjects: (scheme.subjects || []).map(item => Object.assign({}, item))
      }
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    addSubjectRule(direction) {
      this.formData.subjects.push({
        subjectId: undefined,
        digest: this.schemeName,
        direction: direction === undefined ? FMS_DEBIT_CREDIT_DIRECTION.DEBIT : direction,
        amountRatio: this.schemeType === FMS_CLOSING_TYPE.UNPAID_VAT ? 100 : 1
      })
    },
    validateSubjectRules() {
      if (this.formData.subjects.length < 2 || this.formData.subjects.some(item => !item.digest || !item.subjectId)) {
        this.$modal.msgWarning('请完整填写至少两条凭证分录规则')
        return false
      }
      const total = direction => this.formData.subjects.filter(item => item.direction === direction)
        .reduce((sum, item) => sum + Number(item.amountRatio), 0)
      const debitRatio = total(FMS_DEBIT_CREDIT_DIRECTION.DEBIT)
      const creditRatio = total(FMS_DEBIT_CREDIT_DIRECTION.CREDIT)
      if (debitRatio <= 0 || debitRatio > 100 || Math.abs(debitRatio - creditRatio) > 0.001 ||
          (this.schemeType === FMS_CLOSING_TYPE.UNPAID_VAT && Math.abs(debitRatio - 100) > 0.001)) {
        this.$modal.msgWarning(this.ratioTip)
        return false
      }
      return true
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid || !this.validateSubjectRules()) return
        this.submitting = true
        FmsClosingSchemeApi.updateSpecialClosingSettings(this.formData).then(() => {
          this.$modal.msgSuccess('保存成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.submitting = false })
      })
    }
  }
}
</script>

<style scoped>
.word-select { width: 260px; }
.full-width { width: 100%; }
.rules-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-weight: 600; }
.form-tip { margin-top: 10px; color: #909399; font-size: 13px; }
.danger-text { color: #f56c6c; }
</style>
