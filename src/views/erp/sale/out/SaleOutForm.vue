<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="1440px"
      append-to-body
      custom-class="sale-out-dialog"
    >
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        :disabled="disabled"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item
              label="出库单号"
              prop="no"
            >
              <el-input
                v-model="formData.no"
                disabled
                placeholder="保存时自动生成"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="出库时间"
              prop="outTime"
            >
              <el-date-picker
                v-model="formData.outTime"
                type="date"
                value-format="timestamp"
                placeholder="选择出库时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="关联订单"
              prop="orderNo"
            >
              <el-input
                v-model="formData.orderNo"
                readonly
              >
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="openSaleOrderOutEnableList"
                >
                  选择
                </el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="客户"
              prop="customerId"
            >
              <el-select
                v-model="formData.customerId"
                clearable
                filterable
                disabled
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
                v-model="formData.saleUserId"
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
                v-model="formData.remark"
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
                v-model="formData.fileUrl"
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
          <el-tabs v-model="subTabsName">
            <el-tab-pane
              label="出库产品清单"
              name="item"
            >
              <SaleOutItemForm
                ref="itemForm"
                :items="formData.items"
                :disabled="disabled"
              />
            </el-tab-pane>
          </el-tabs>
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
                v-model="formData.discountPercent"
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
                :value="erpPriceInputFormatter(formData.discountPrice)"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优惠后金额">
              <el-input
                :value="erpPriceInputFormatter(formData.totalPrice - formData.otherPrice)"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="其它费用"
              prop="otherPrice"
            >
              <el-input-number
                v-model="formData.otherPrice"
                controls-position="right"
                :min="0"
                :precision="2"
                placeholder="请输入其它费用"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="结算账户"
              prop="accountId"
            >
              <el-select
                v-model="formData.accountId"
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
            <el-form-item label="应收金额">
              <el-input
                :value="erpPriceInputFormatter(formData.totalPrice)"
                disabled
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

    <SaleOrderOutEnableList
      ref="saleOrderOutEnableList"
      @success="handleSaleOrderChange"
    />
  </div>
</template>

<script>
import FileUpload from '@/components/FileUpload'
import { getCustomerSimpleList } from '@/api/erp/sale/customer'
import { getAccountSimpleList } from '@/api/erp/finance/account'
import { getSimpleUserList } from '@/api/system/user'
import { SaleOutApi } from '@/api/erp/sale/out'
import { erpPriceInputFormatter, erpPriceMultiply } from '@/utils'
import SaleOrderOutEnableList from '@/views/erp/sale/order/components/SaleOrderOutEnableList.vue'
import SaleOutItemForm from './components/SaleOutItemForm.vue'

export default {
  name: 'SaleOutForm',
  components: { FileUpload, SaleOrderOutEnableList, SaleOutItemForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      customerList: [],
      accountList: [],
      userList: [],
      subTabsName: 'item',
      formData: this.defaultForm(),
      formRules: {
        customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
        outTime: [{ required: true, message: '出库时间不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    disabled() {
      return this.formType === 'detail'
    }
  },
  watch: {
    formData: {
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
        customerId: undefined,
        accountId: undefined,
        saleUserId: undefined,
        orderId: undefined,
        outTime: undefined,
        remark: undefined,
        fileUrl: '',
        discountPercent: 0,
        discountPrice: 0,
        totalPrice: 0,
        otherPrice: 0,
        orderNo: undefined,
        items: [],
        no: undefined
      }
    },
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'detail'
        ? '销售出库详情'
        : this.formType === 'update' ? '修改销售出库' : '新增销售出库'
      this.formData = this.defaultForm()
      this.customerList = []
      this.accountList = []
      this.userList = []
      this.subTabsName = 'item'
      this.dialogVisible = true
      this.formLoading = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })

      const detailRequest = id !== undefined && id !== null
        ? SaleOutApi.getSaleOut(id)
        : Promise.resolve(null)
      return Promise.all([
        detailRequest,
        getCustomerSimpleList(),
        getSimpleUserList(),
        getAccountSimpleList()
      ])
        .then(([detailResponse, customerResponse, userResponse, accountResponse]) => {
          if (detailResponse) {
            this.formData = Object.assign(this.defaultForm(), detailResponse.data)
            this.formData.items = detailResponse.data.items || []
          }
          this.customerList = customerResponse.data
          this.userList = userResponse.data
          this.accountList = accountResponse.data
          const defaultAccount = this.accountList.find((item) => item.defaultStatus)
          if (defaultAccount) this.formData.accountId = defaultAccount.id
          this.calculateTotals()
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = this.defaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    openSaleOrderOutEnableList() {
      this.$refs.saleOrderOutEnableList.open()
    },
    handleSaleOrderChange(order) {
      this.formData.orderId = order.id
      this.formData.orderNo = order.no
      this.formData.customerId = order.customerId
      this.formData.accountId = order.accountId
      this.formData.saleUserId = order.saleUserId
      this.formData.discountPercent = order.discountPercent == null ? 0 : order.discountPercent
      this.formData.remark = order.remark
      this.formData.fileUrl = order.fileUrl == null ? '' : order.fileUrl
      this.formData.items = (order.items || [])
        .map((item) => Object.assign({}, item, {
          id: undefined,
          orderItemId: item.id,
          totalCount: item.count,
          count: item.count - (item.outCount == null ? 0 : item.outCount)
        }))
        .filter((item) => item.count > 0)
    },
    calculateTotals() {
      const items = this.formData && Array.isArray(this.formData.items)
        ? this.formData.items
        : []
      const productTotalPrice = items.reduce((sum, item) => {
        const itemPrice = Number(item.totalPrice)
        return Number.isFinite(itemPrice) ? sum + itemPrice : sum
      }, 0)
      const discountPercent = this.formData.discountPercent == null
        ? 0
        : Number(this.formData.discountPercent)
      const discountPrice = erpPriceMultiply(
        productTotalPrice,
        (Number.isFinite(discountPercent) ? discountPercent : 0) / 100
      ) || 0
      const otherPrice = Number(this.formData.otherPrice) || 0
      const totalPrice = productTotalPrice - discountPrice + otherPrice
      if (this.formData.discountPrice !== discountPrice) {
        this.formData.discountPrice = discountPrice
      }
      if (this.formData.totalPrice !== totalPrice) {
        this.formData.totalPrice = totalPrice
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        const itemForm = this.$refs.itemForm
        const submit = () => {
          this.formLoading = true
          const request = this.formType === 'create'
            ? SaleOutApi.createSaleOut(this.formData)
            : SaleOutApi.updateSaleOut(this.formData)
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
