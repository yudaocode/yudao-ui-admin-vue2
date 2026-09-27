<template>
  <Dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="1080px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :disabled="disabled"
    >
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item
          label="收款单号"
          prop="no"
        ><el-input
          v-model="formData.no"
          disabled
          placeholder="保存时自动生成"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="收款时间"
          prop="receiptTime"
        ><el-date-picker
          v-model="formData.receiptTime"
          type="date"
          value-format="timestamp"
          placeholder="选择收款时间"
          style="width:100%"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="客户"
          prop="customerId"
        ><el-select
          v-model="formData.customerId"
          clearable
          filterable
          placeholder="请选择客户"
          style="width:100%"
        ><el-option
          v-for="item in customerList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="财务人员"
          prop="financeUserId"
        ><el-select
          v-model="formData.financeUserId"
          clearable
          filterable
          placeholder="请选择财务人员"
          style="width:100%"
        ><el-option
          v-for="item in userList"
          :key="item.id"
          :label="item.nickname"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="16"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          :rows="1"
          placeholder="请输入备注"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="附件"
          prop="fileUrl"
        ><FileUpload
          v-model="formData.fileUrl"
          :is-show-tip="false"
          :limit="1"
        /></el-form-item></el-col>
      </el-row>

      <el-card
        shadow="never"
        class="item-card"
      >
        <div slot="header">销售出库、退货单</div>
        <FinanceReceiptItemForm
          ref="itemForm"
          :items="formData.items"
          :customer-id="formData.customerId"
          :disabled="disabled"
        />
      </el-card>

      <el-row
        :gutter="20"
        class="summary-row"
      >
        <el-col :span="8"><el-form-item
          label="收款账户"
          prop="accountId"
        ><el-select
          v-model="formData.accountId"
          clearable
          filterable
          placeholder="请选择结算账户"
          style="width:100%"
        ><el-option
          v-for="item in accountList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="合计收款"
          prop="totalPrice"
        ><el-input
          :value="erpPriceInputFormatter(formData.totalPrice)"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="优惠金额"
          prop="discountPrice"
        ><el-input-number
          v-model="formData.discountPrice"
          controls-position="right"
          :precision="2"
          style="width:100%"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="实际收款"><el-input
          :value="erpPriceInputFormatter(formData.receiptPrice)"
          disabled
        /></el-form-item></el-col>
      </el-row>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    ><el-button
      v-if="!disabled"
      type="primary"
      :loading="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="cancel">取 消</el-button></div>
  </Dialog>
</template>

<script>
import FileUpload from '@/components/FileUpload'
import Dialog from '@/components/Dialog'
import { getCustomerSimpleList } from '@/api/erp/sale/customer'
import { getSimpleUserList } from '@/api/system/user'
import { getAccountSimpleList } from '@/api/erp/finance/account'
import { FinanceReceiptApi } from '@/api/erp/finance/receipt'
import { erpPriceInputFormatter } from '@/utils'
import FinanceReceiptItemForm from './components/FinanceReceiptItemForm.vue'

export default {
  name: 'FinanceReceiptForm',
  components: { Dialog, FileUpload, FinanceReceiptItemForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      customerList: [],
      userList: [],
      accountList: [],
      formData: this.defaultForm(),
      rules: {
        customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
        receiptTime: [{ required: true, message: '收款时间不能为空', trigger: 'change' }]
      }
    }
  },
  computed: { disabled() { return this.formType === 'detail' } },
  watch: { formData: { deep: true, handler() { this.calculateTotals() } }},
  methods: {
    erpPriceInputFormatter,
    defaultForm() {
      return { id: undefined, no: undefined, customerId: undefined, accountId: undefined, financeUserId: undefined, receiptTime: Date.now(), remark: undefined, fileUrl: '', totalPrice: 0, discountPrice: 0, receiptPrice: 0, items: [] }
    },
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'detail' ? '收款单详情' : this.formType === 'update' ? '修改收款单' : '新增收款单'
      this.formData = this.defaultForm()
      this.customerList = []
      this.userList = []
      this.accountList = []
      this.dialogVisible = true
      this.formLoading = true
      const detailRequest = id !== undefined && id !== null
        ? FinanceReceiptApi.getFinanceReceipt(id)
        : Promise.resolve(null)
      const request = Promise.all([detailRequest, getCustomerSimpleList(), getSimpleUserList(), getAccountSimpleList()]).then(([detail, customer, user, account]) => {
        if (detail) this.formData = Object.assign(this.defaultForm(), detail.data, { items: detail.data.items || [] })
        this.customerList = customer.data
        this.userList = user.data
        this.accountList = account.data
        if (!this.formData.accountId) {
          const defaultAccount = this.accountList.find(item => item.defaultStatus)
          if (defaultAccount) this.formData.accountId = defaultAccount.id
        }
        this.calculateTotals()
      }).finally(() => { this.formLoading = false })
      this.$nextTick(() => { if (this.$refs.form) this.$refs.form.clearValidate() })
      return request
    },
    cancel() {
      this.dialogVisible = false
      this.formData = this.defaultForm()
      this.$nextTick(() => { if (this.$refs.form) this.$refs.form.clearValidate() })
    },
    calculateTotals() {
      const items = this.formData && Array.isArray(this.formData.items) ? this.formData.items : []
      const totalPrice = this.round(items.reduce((sum, item) => sum + (Number(item.receiptPrice) || 0), 0))
      const discountPrice = Number(this.formData.discountPrice) || 0
      if (this.formData.totalPrice !== totalPrice) this.formData.totalPrice = totalPrice
      const receiptPrice = this.round(totalPrice - discountPrice)
      if (this.formData.receiptPrice !== receiptPrice) this.formData.receiptPrice = receiptPrice
    },
    round(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100 },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      await this.$refs.itemForm.validate()
      this.formLoading = true
      try {
        await (this.formType === 'create'
          ? FinanceReceiptApi.createFinanceReceipt(this.formData)
          : FinanceReceiptApi.updateFinanceReceipt(this.formData))
        this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>

<style scoped>
.dialog-footer { text-align: right; }
.item-card { margin-bottom: 20px; }
</style>
