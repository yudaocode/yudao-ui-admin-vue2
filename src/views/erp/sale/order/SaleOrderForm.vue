<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1080px"
    append-to-body
    custom-class="sale-order-dialog"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="100px"
      :disabled="disabled"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            label="订单单号"
            prop="no"
          >
            <el-input
              v-model="form.no"
              disabled
              placeholder="保存时自动生成"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="订单时间"
            prop="orderTime"
          >
            <el-date-picker
              v-model="form.orderTime"
              type="date"
              value-format="timestamp"
              placeholder="选择订单时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="客户"
            prop="customerId"
          >
            <el-select
              v-model="form.customerId"
              clearable
              filterable
              placeholder="请选择客户"
              style="width: 100%"
            >
              <el-option
                v-for="item in customerList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="销售人员"
            prop="saleUserId"
          >
            <el-select
              v-model="form.saleUserId"
              clearable
              filterable
              placeholder="请选择销售人员"
              style="width: 100%"
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="1"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="附件"
            prop="fileUrl"
          >
            <FileUpload
              v-model="form.fileUrl"
              :is-show-tip="false"
              :limit="1"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-card
        shadow="never"
        class="item-card"
      >
        <div slot="header">订单产品清单</div>
        <SaleOrderItemForm
          ref="itemForm"
          :items="form.items"
          :disabled="disabled"
        />
      </el-card>

      <el-row
        :gutter="20"
        class="summary-row"
      >
        <el-col :span="8">
          <el-form-item
            label="优惠率（%）"
            prop="discountPercent"
          >
            <el-input-number
              v-model="form.discountPercent"
              controls-position="right"
              :min="0"
              :precision="2"
              placeholder="请输入优惠率"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="收款优惠"
            prop="discountPrice"
          >
            <el-input
              :value="erpPriceInputFormatter(form.discountPrice)"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优惠后金额">
            <el-input
              :value="erpPriceInputFormatter(form.totalPrice)"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="结算账户"
            prop="accountId"
          >
            <el-select
              v-model="form.accountId"
              clearable
              filterable
              placeholder="请选择结算账户"
              style="width: 100%"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="收取订金"
            prop="depositPrice"
          >
            <el-input-number
              v-model="form.depositPrice"
              controls-position="right"
              :min="0"
              :precision="2"
              placeholder="请输入收取订金"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        v-if="!disabled"
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import FileUpload from '@/components/FileUpload'
import { getCustomerSimpleList } from '@/api/erp/sale/customer'
import { getAccountSimpleList } from '@/api/erp/finance/account'
import { getSimpleUserList } from '@/api/system/user'
import { SaleOrderApi } from '@/api/erp/sale/order'
import { erpPriceInputFormatter, erpPriceMultiply } from '@/utils'
import SaleOrderItemForm from './components/SaleOrderItemForm.vue'

export default {
  name: 'SaleOrderForm',
  components: { FileUpload, SaleOrderItemForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      customerList: [],
      accountList: [],
      userList: [],
      form: this.defaultForm(),
      rules: {
        customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
        orderTime: [{ required: true, message: '订单时间不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    disabled() {
      return this.formType === 'detail'
    }
  },
  watch: {
    form: {
      deep: true,
      handler() {
        this.calculateTotals()
      }
    }
  },
  methods: {
    erpPriceInputFormatter,
    defaultForm() {
      return {
        id: undefined,
        no: undefined,
        customerId: undefined,
        accountId: undefined,
        saleUserId: undefined,
        orderTime: undefined,
        remark: undefined,
        fileUrl: '',
        discountPercent: 0,
        discountPrice: 0,
        totalPrice: 0,
        depositPrice: 0,
        items: []
      }
    },
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'detail'
        ? '销售订单详情'
        : this.formType === 'update' ? '修改销售订单' : '新增销售订单'
      this.form = this.defaultForm()
      this.customerList = []
      this.accountList = []
      this.userList = []
      this.dialogVisible = true
      this.formLoading = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })

      const detailRequest = id !== undefined && id !== null
        ? SaleOrderApi.getSaleOrder(id)
        : Promise.resolve(null)
      return Promise.all([
        detailRequest,
        getCustomerSimpleList(),
        getSimpleUserList(),
        getAccountSimpleList()
      ])
        .then(([detailResponse, customerResponse, userResponse, accountResponse]) => {
          if (detailResponse) {
            this.form = Object.assign(this.defaultForm(), detailResponse.data)
            this.form.items = detailResponse.data.items || []
          }
          this.customerList = customerResponse.data
          this.userList = userResponse.data
          this.accountList = accountResponse.data
          const defaultAccount = this.accountList.find((item) => item.defaultStatus)
          if (defaultAccount) this.form.accountId = defaultAccount.id
          this.calculateTotals()
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = this.defaultForm()
      this.customerList = []
      this.accountList = []
      this.userList = []
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    calculateTotals() {
      const items = this.form && Array.isArray(this.form.items) ? this.form.items : []
      const totalPrice = items.reduce((sum, item) => {
        const itemTotal = Number(item.totalPrice)
        return Number.isFinite(itemTotal) ? sum + itemTotal : sum
      }, 0)
      const discountPercent = this.form.discountPercent == null ? 0 : Number(this.form.discountPercent)
      const discountPrice = erpPriceMultiply(
        totalPrice,
        (Number.isFinite(discountPercent) ? discountPercent : 0) / 100
      ) || 0
      const discountedTotalPrice = erpPriceMultiply(totalPrice - discountPrice, 1) || 0
      if (this.form.discountPrice !== discountPrice) this.form.discountPrice = discountPrice
      if (this.form.totalPrice !== discountedTotalPrice) this.form.totalPrice = discountedTotalPrice
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        const itemForm = this.$refs.itemForm
        const submit = () => {
          this.formLoading = true
          const request = this.formType === 'create'
            ? SaleOrderApi.createSaleOrder(this.form)
            : SaleOrderApi.updateSaleOrder(this.form)
          request
            .then(() => {
              this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
              this.dialogVisible = false
              this.$emit('success')
            })
            .finally(() => {
              this.formLoading = false
            })
        }
        if (itemForm && itemForm.validate) {
          itemForm.validate((itemValid) => {
            if (itemValid) submit()
          })
        } else {
          submit()
        }
      })
    }
  }
}
</script>

<style scoped>
.item-card {
  margin-bottom: 20px;
}

.summary-row {
  margin-top: 8px;
}

.dialog-footer {
  text-align: right;
}
</style>
