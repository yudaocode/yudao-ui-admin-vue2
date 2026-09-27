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
          label="付款单号"
          prop="no"
        ><el-input
          v-model="formData.no"
          disabled
          placeholder="保存时自动生成"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="付款时间"
          prop="paymentTime"
        ><el-date-picker
          v-model="formData.paymentTime"
          type="date"
          value-format="timestamp"
          placeholder="选择付款时间"
          style="width:100%"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="供应商"
          prop="supplierId"
        ><el-select
          v-model="formData.supplierId"
          clearable
          filterable
          placeholder="请选择供应商"
          style="width:100%"
        ><el-option
          v-for="item in supplierList"
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
        <div slot="header">采购入库、退货单</div>
        <FinancePaymentItemForm
          ref="itemForm"
          :items="formData.items"
          :supplier-id="formData.supplierId"
          :disabled="disabled"
        />
      </el-card>

      <el-row
        :gutter="20"
        class="summary-row"
      >
        <el-col :span="8"><el-form-item
          label="付款账户"
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
          label="合计付款"
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
        <el-col :span="8"><el-form-item label="实际付款"><el-input
          :value="erpPriceInputFormatter(formData.paymentPrice)"
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
import { getSupplierSimpleList } from '@/api/erp/purchase/supplier'
import { getSimpleUserList } from '@/api/system/user'
import { getAccountSimpleList } from '@/api/erp/finance/account'
import { FinancePaymentApi } from '@/api/erp/finance/payment'
import { erpPriceInputFormatter } from '@/utils'
import FinancePaymentItemForm from './components/FinancePaymentItemForm.vue'

export default {
  name: 'FinancePaymentForm',
  components: { Dialog, FileUpload, FinancePaymentItemForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      supplierList: [],
      userList: [],
      accountList: [],
      formData: this.defaultForm(),
      rules: {
        supplierId: [{ required: true, message: '供应商不能为空', trigger: 'change' }],
        paymentTime: [{ required: true, message: '付款时间不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    disabled() { return this.formType === 'detail' }
  },
  watch: {
    formData: { deep: true, handler() { this.calculateTotals() } }
  },
  methods: {
    erpPriceInputFormatter,
    defaultForm() {
      return { id: undefined, no: undefined, supplierId: undefined, accountId: undefined, financeUserId: undefined, paymentTime: Date.now(), remark: undefined, fileUrl: '', totalPrice: 0, discountPrice: 0, paymentPrice: 0, items: [] }
    },
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'detail' ? '付款单详情' : this.formType === 'update' ? '修改付款单' : '新增付款单'
      this.formData = this.defaultForm()
      this.supplierList = []
      this.userList = []
      this.accountList = []
      this.dialogVisible = true
      this.formLoading = true
      const detailRequest = id !== undefined && id !== null
        ? FinancePaymentApi.getFinancePayment(id)
        : Promise.resolve(null)
      const request = Promise.all([detailRequest, getSupplierSimpleList(), getSimpleUserList(), getAccountSimpleList()]).then(([detail, supplier, user, account]) => {
        if (detail) this.formData = Object.assign(this.defaultForm(), detail.data, { items: detail.data.items || [] })
        this.supplierList = supplier.data
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
      const totalPrice = this.round(items.reduce((sum, item) => sum + (Number(item.paymentPrice) || 0), 0))
      const discountPrice = Number(this.formData.discountPrice) || 0
      if (this.formData.totalPrice !== totalPrice) this.formData.totalPrice = totalPrice
      const paymentPrice = this.round(totalPrice - discountPrice)
      if (this.formData.paymentPrice !== paymentPrice) this.formData.paymentPrice = paymentPrice
    },
    round(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100 },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      await this.$refs.itemForm.validate()
      this.formLoading = true
      try {
        await (this.formType === 'create'
          ? FinancePaymentApi.createFinancePayment(this.formData)
          : FinancePaymentApi.updateFinancePayment(this.formData))
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
