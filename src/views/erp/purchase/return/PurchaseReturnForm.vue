<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="1440px"
      append-to-body
      custom-class="purchase-return-dialog"
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
              label="退货单号"
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
              label="退货时间"
              prop="returnTime"
            >
              <el-date-picker
                v-model="formData.returnTime"
                type="date"
                value-format="timestamp"
                placeholder="选择退货时间"
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
                  @click="openPurchaseOrderReturnEnableList"
                >选择</el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="供应商"
              prop="supplierId"
            >
              <el-select
                v-model="formData.supplierId"
                clearable
                filterable
                disabled
                placeholder="请选择供应商"
                style="width: 100%"
              >
                <el-option
                  v-for="item in supplierList"
                  :key="item.id"
                  :label="item.name"
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
              label="退货产品清单"
              name="item"
            >
              <purchase-return-item-form
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
              label="退款优惠"
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
            <el-form-item
              label="应退金额"
              prop="totalPrice"
            >
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

    <purchase-order-return-enable-list
      ref="purchaseOrderReturnEnableList"
      @success="handlePurchaseOrderChange"
    />
  </div>
</template>

<script>
import FileUpload from '@/components/FileUpload'
import { getSupplierSimpleList } from '@/api/erp/purchase/supplier'
import { getAccountSimpleList } from '@/api/erp/finance/account'
import { getSimpleUserList } from '@/api/system/user'
import { PurchaseReturnApi } from '@/api/erp/purchase/return'
import { erpPriceInputFormatter, erpPriceMultiply } from '@/utils'
import PurchaseOrderReturnEnableList from '@/views/erp/purchase/order/components/PurchaseOrderReturnEnableList.vue'
import PurchaseReturnItemForm from './components/PurchaseReturnItemForm.vue'

export default {
  name: 'PurchaseReturnForm',
  components: { FileUpload, PurchaseOrderReturnEnableList, PurchaseReturnItemForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      subTabsName: 'item',
      supplierList: [],
      accountList: [],
      userList: [],
      formData: this.defaultForm(),
      formRules: {
        supplierId: [{ required: true, message: '供应商不能为空', trigger: 'blur' }],
        returnTime: [{ required: true, message: '退货时间不能为空', trigger: 'blur' }]
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
        supplierId: undefined,
        accountId: undefined,
        orderId: undefined,
        returnTime: undefined,
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
    /** 打开新增、修改或详情弹窗 */
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'detail'
        ? '采购退货详情'
        : this.formType === 'update' ? '修改采购退货' : '新增采购退货'
      this.resetForm()
      this.dialogVisible = true
      this.formLoading = true

      const detailRequest = id !== undefined && id !== null
        ? PurchaseReturnApi.getPurchaseReturn(id)
        : Promise.resolve(null)
      return Promise.all([
        detailRequest,
        getSupplierSimpleList(),
        getSimpleUserList(),
        getAccountSimpleList()
      ]).then(([detailResponse, supplierResponse, userResponse, accountResponse]) => {
        if (detailResponse) {
          this.formData = Object.assign(this.defaultForm(), detailResponse.data, {
            items: detailResponse.data.items || []
          })
        }
        this.supplierList = supplierResponse.data
        this.userList = userResponse.data
        this.accountList = accountResponse.data
        if (this.formData.accountId === undefined || this.formData.accountId === null) {
          const defaultAccount = this.accountList.find(item => item.defaultStatus)
          if (defaultAccount) this.formData.accountId = defaultAccount.id
        }
        this.calculateTotals()
      }).finally(() => {
        this.formLoading = false
      })
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = this.defaultForm()
      this.subTabsName = 'item'
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    /** 计算退款优惠和应退金额 */
    calculateTotals() {
      if (!this.formData) return
      const items = Array.isArray(this.formData.items) ? this.formData.items : []
      const productTotal = items.reduce((sum, item) => {
        const price = Number(item.totalPrice)
        return Number.isFinite(price) ? sum + price : sum
      }, 0)
      const percent = this.formData.discountPercent == null
        ? 0
        : Number(this.formData.discountPercent)
      const discountPrice = erpPriceMultiply(
        productTotal,
        (Number.isFinite(percent) ? percent : 0) / 100
      ) || 0
      const otherPrice = Number(this.formData.otherPrice) || 0
      const totalPrice = productTotal - discountPrice + otherPrice
      if (!Object.is(this.formData.discountPrice, discountPrice)) {
        this.formData.discountPrice = discountPrice
      }
      if (!Object.is(this.formData.totalPrice, totalPrice)) {
        this.formData.totalPrice = totalPrice
      }
    },
    openPurchaseOrderReturnEnableList() {
      this.$refs.purchaseOrderReturnEnableList.open()
    },
    /** 将可退货订单映射为采购退货 */
    handlePurchaseOrderChange(order) {
      if (!order) return
      this.formData.orderId = order.id
      this.formData.orderNo = order.no
      this.formData.supplierId = order.supplierId
      this.formData.accountId = order.accountId
      this.formData.discountPercent = order.discountPercent == null ? 0 : order.discountPercent
      this.formData.remark = order.remark
      this.formData.fileUrl = order.fileUrl == null ? '' : order.fileUrl
      const items = Array.isArray(order.items) ? order.items : []
      this.formData.items = items.map(item => Object.assign({}, item, {
        id: undefined,
        orderItemId: item.id,
        count: (Number(item.inCount) || 0) - (Number(item.returnCount) || 0)
      })).filter(item => item.count > 0)
      this.calculateTotals()
    },
    /** 提交新增或修改 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const itemForm = this.$refs.itemForm
        const submit = () => {
          this.formLoading = true
          const request = this.formType === 'create'
            ? PurchaseReturnApi.createPurchaseReturn(this.formData)
            : PurchaseReturnApi.updatePurchaseReturn(this.formData)
          request.then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
          }).finally(() => {
            this.formLoading = false
          })
        }
        if (itemForm && itemForm.validate) {
          itemForm.validate(itemValid => {
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
