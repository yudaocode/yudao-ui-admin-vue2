<template>
  <el-dialog title="开始记账" :visible.sync="visible" width="620px" append-to-body>
    <el-form ref="form" v-loading="loading" :model="formData" :rules="rules" label-width="110px">
      <el-form-item label="公司名称"><el-input :value="accountSet && accountSet.companyName" disabled /></el-form-item>
      <el-form-item label="本位币" prop="currencyCode"><el-select v-model="formData.currencyCode" disabled class="width-full"><el-option v-for="item in currencies" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item label="启用期间" prop="startTime"><el-date-picker v-model="formData.startTime" type="month" value-format="timestamp" class="width-full" /></el-form-item>
      <el-form-item label="会计制度" prop="standard"><el-select v-model="formData.standard" class="width-full"><el-option v-for="item in standards" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item label="科目级次" prop="level"><el-select v-model="formData.level" class="width-full"><el-option v-for="level in 8" :key="level" :label="level + ' 级'" :value="level" /></el-select></el-form-item>
      <el-form-item label="科目编码规则" prop="subjectCodeRule"><el-input v-model="formData.subjectCodeRule" placeholder="例如：4-2-2-2" /></el-form-item>
      <el-form-item label="余额方向" prop="ledgerBalanceMode"><el-select v-model="formData.ledgerBalanceMode" class="width-full"><el-option v-for="item in balanceModes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-alert :closable="false" title="初始化后将建立本位币、财务参数和默认凭证字，启用期间不可随意变更" type="info" show-icon />
    </el-form>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="loading" @click="submit">开始记账</el-button><el-button @click="visible = false">取 消</el-button></div>
  </el-dialog>
</template>
<script>
import { initializeAccountSet } from '@/api/fms/config/account-set'
import { FMS_ACCOUNTING_STANDARD_OPTIONS, FMS_CURRENCY_OPTIONS, FMS_DEFAULT_SUBJECT_CODE_RULE, FMS_DEFAULT_SUBJECT_LEVEL, FMS_LEDGER_BALANCE_MODE_OPTIONS } from '@/views/fms/utils/constants'
export default {
  name: 'FmsAccountSetInitializeForm',
  data() {
    return {
      visible: false,
      loading: false,
      accountSet: null,
      currencies: FMS_CURRENCY_OPTIONS,
      standards: FMS_ACCOUNTING_STANDARD_OPTIONS,
      balanceModes: FMS_LEDGER_BALANCE_MODE_OPTIONS,
      formData: this.defaults(),
      rules: {
        currencyCode: [{ required: true, message: '本位币不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '启用期间不能为空', trigger: 'change' }],
        standard: [{ required: true, message: '会计制度不能为空', trigger: 'change' }],
        level: [{ required: true, message: '科目级次不能为空', trigger: 'change' }],
        subjectCodeRule: [
          { required: true, message: '科目编码规则不能为空', trigger: 'blur' },
          { pattern: /^([2-5]-)*[2-5]$/, message: '各级编码长度必须为 2 至 5 位', trigger: 'blur' }
        ],
        ledgerBalanceMode: [{ required: true, message: '余额方向不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaults(id) { const date = new Date(); date.setDate(1); date.setHours(0, 0, 0, 0); return { accountSetId: id || 0, currencyCode: 'RMB', startTime: date.getTime(), standard: FMS_ACCOUNTING_STANDARD_OPTIONS[0].value, level: FMS_DEFAULT_SUBJECT_LEVEL, subjectCodeRule: FMS_DEFAULT_SUBJECT_CODE_RULE, ledgerBalanceMode: 1 } },
    open(row) { this.accountSet = row; this.formData = this.defaults(row && row.id); this.visible = true; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) },
    submit() { this.$refs.form.validate(valid => { if (!valid || !this.accountSet) return; this.loading = true; initializeAccountSet(this.formData).then(() => { this.$modal.msgSuccess('账套初始化成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false }) }) }
  }
}
</script>
<style scoped>.width-full{width:100%}</style>
