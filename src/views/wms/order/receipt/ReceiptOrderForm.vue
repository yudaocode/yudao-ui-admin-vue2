<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="1180px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="88px"
    >
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item
          label="入库单号"
          prop="no"
        ><el-input
          v-model="formData.no"
          maxlength="64"
          placeholder="请输入入库单号"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="入库类型"
          prop="type"
        ><el-select
          v-model="formData.type"
          style="width: 100%"
          placeholder="请选择入库类型"
        ><el-option
          v-for="item in receiptTypeDictDatas"
          :key="item.value"
          :label="item.label"
          :value="Number(item.value)"
        /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="仓库"
          prop="warehouseId"
        ><warehouse-select v-model="formData.warehouseId" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="单据日期"
          prop="orderTime"
        ><el-date-picker
          v-model="formData.orderTime"
          type="date"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 100%"
          placeholder="请选择单据日期"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="供应商"
          prop="merchantId"
        ><merchant-select
          v-model="formData.merchantId"
          supplier
          placeholder="请选择供应商"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="业务单号"
          prop="bizOrderNo"
        ><el-input
          v-model="formData.bizOrderNo"
          maxlength="64"
          placeholder="请输入业务单号"
        /></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          maxlength="255"
          placeholder="请输入备注"
        /></el-form-item></el-col>
      </el-row>
      <div class="detail-head">
        <strong>入库明细</strong><el-button
          type="primary"
          plain
          size="mini"
          icon="el-icon-plus"
          :disabled="!formData.warehouseId"
          @click="openSkuSelect"
        >添加商品</el-button>
      </div>
      <el-table
        :data="formData.details"
        border
        size="small"
        empty-text="暂无商品明细"
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column
          label="商品"
          min-width="200"
        ><template slot-scope="scope"><div>{{ scope.row.itemName || "-" }}</div>
          <span class="sub-text">{{
            scope.row.itemCode || ""
          }}</span></template></el-table-column>
        <el-table-column
          label="规格"
          min-width="200"
        ><template slot-scope="scope"><div>{{ scope.row.skuName || "-" }}</div>
          <span class="sub-text">{{
            scope.row.skuCode || ""
          }}</span></template></el-table-column>
        <el-table-column
          label="数量"
          prop="quantity"
          width="150"
        ><template slot-scope="scope"><el-input-number
          v-model="scope.row.quantity"
          :controls="false"
          :min="0"
          :precision="QUANTITY_PRECISION"
          style="width: 100%"
          @change="handleQuantityChange(scope.row)"
        /></template></el-table-column>
        <el-table-column
          label="单价(元)"
          prop="price"
          width="150"
        ><template slot-scope="scope"><el-input-number
          v-model="scope.row.price"
          :controls="false"
          :min="0"
          :precision="PRICE_PRECISION"
          style="width: 100%"
          @change="handlePriceChange(scope.row)"
        /></template></el-table-column>
        <el-table-column
          label="金额(元)"
          prop="totalPrice"
          width="150"
        ><template slot-scope="scope"><el-input-number
          v-model="scope.row.totalPrice"
          :controls="false"
          :min="0"
          :precision="PRICE_PRECISION"
          style="width: 100%"
          @change="handleTotalPriceChange(scope.row)"
        /></template></el-table-column>
        <el-table-column
          label="操作"
          width="70"
          align="center"
        ><template slot-scope="scope"><el-button
          type="text"
          class="danger-text"
          @click="deleteDetail(scope.$index)"
        >删除</el-button></template></el-table-column>
      </el-table>
      <item-sku-select
        ref="skuSelect"
        @change="handleSkuSelect"
      />
    </el-form>
    <span slot="footer" class="dialog-footer"><span class="footer-left"><el-button
      v-if="isSavedPrepareOrder"
      v-hasPermi="['wms:receipt-order:complete']"
      type="success"
      :disabled="loading"
      @click="handleComplete"
    >完成入库</el-button><el-button
      v-if="isSavedPrepareOrder"
      v-hasPermi="['wms:receipt-order:cancel']"
      type="danger"
      :disabled="loading"
      @click="handleCancel"
    >作废</el-button></span><span><el-button
      v-if="isPrepareOrder"
      type="primary"
      :loading="loading"
      @click="submitForm"
    >保 存</el-button><el-button @click="visible = false">取 消</el-button></span></span>
  </el-dialog>
</template>

<script>
import { ReceiptOrderApi } from '@/api/wms/order/receipt'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { OrderStatusEnum, OrderUpdateStatusList } from '@/views/wms/utils/constants'
import {
  QUANTITY_PRECISION,
  PRICE_PRECISION,
  multiplyPrice,
  dividePrice,
  formatQuantity,
  formatPrice,
  sumQuantity,
  sumPrice
} from '@/views/wms/utils/format'
import { generateOrderNo } from '@/views/wms/utils/order'
import MerchantSelect from '@/views/wms/md/merchant/components/MerchantSelect.vue'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import ItemSkuSelect from '@/views/wms/md/item/sku/components/ItemSkuSelect.vue'

export default {
  name: 'WmsReceiptOrderForm',
  components: { MerchantSelect, WarehouseSelect, ItemSkuSelect },
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      originalFormData: '',
      receiptTypeDictDatas: getDictDatas(DICT_TYPE.WMS_RECEIPT_ORDER_TYPE),
      QUANTITY_PRECISION,
      PRICE_PRECISION,
      formData: this.getDefaultForm(),
      rules: {
        no: [{ required: true, message: '入库单号不能为空', trigger: 'blur' }],
        type: [
          { required: true, message: '入库类型不能为空', trigger: 'change' }
        ],
        warehouseId: [
          { required: true, message: '仓库不能为空', trigger: 'change' }
        ],
        orderTime: [
          { required: true, message: '单据日期不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    isPrepareOrder() {
      return (
        !this.formData.id ||
        OrderUpdateStatusList.indexOf(Number(this.formData.status)) >= 0
      )
    },
    isSavedPrepareOrder() {
      return (
        !!this.formData.id &&
        OrderUpdateStatusList.indexOf(Number(this.formData.status)) >= 0
      )
    }
  },
  methods: {
    formatQuantity,
    formatPrice,
    getDefaultForm() {
      return {
        id: undefined,
        no: generateOrderNo('RK'),
        type: undefined,
        orderTime: undefined,
        status: OrderStatusEnum.PREPARE,
        bizOrderNo: undefined,
        merchantId: undefined,
        warehouseId: undefined,
        remark: undefined,
        details: []
      }
    },
    open(type, id) {
      this.visible = true
      this.formType = type || 'create'
      this.title = this.formType === 'update' ? '修改入库单' : '新增入库单'
      this.resetForm()
      if (id === undefined || id === null) {
        this.originalFormData = JSON.stringify(this.buildSubmitData())
        return
      }
      this.loading = true
      ReceiptOrderApi.getReceiptOrder(id)
        .then((response) => {
          const data = Object.assign(
            this.getDefaultForm(),
            response.data
          )
          data.details = Array.isArray(data.details)
            ? data.details.map((item) =>
              Object.assign({}, item, {
                totalPrice:
                    item.totalPrice == null
                      ? multiplyPrice(item.quantity, item.price)
                      : item.totalPrice
              })
            )
            : []
          this.formData = data
          this.originalFormData = JSON.stringify(this.buildSubmitData())
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetForm() {
      this.formData = this.getDefaultForm()
      this.originalFormData = ''
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    openSkuSelect() {
      this.$refs.skuSelect.open(
        (this.formData.details || []).map((item) => item.skuId).filter(Boolean)
      )
    },
    handleSkuSelect(rows) {
      const selected = (this.formData.details || []).map((item) => item.skuId);
      (rows || []).forEach((sku) => {
        if (!sku || !sku.id || selected.indexOf(sku.id) >= 0) return
        this.formData.details.push({
          itemId: sku.itemId,
          itemCode: sku.itemCode,
          itemName: sku.itemName,
          unit: sku.unit,
          skuId: sku.id,
          skuCode: sku.code,
          skuName: sku.name,
          quantity: undefined,
          price: undefined,
          totalPrice: undefined
        })
        selected.push(sku.id)
      })
    },
    deleteDetail(index) {
      this.formData.details.splice(index, 1)
    },
    handleQuantityChange(detail) {
      if (detail.price !== undefined && detail.price !== null) {
        this.$set(
          detail,
          'totalPrice',
          multiplyPrice(detail.quantity, detail.price)
        )
      } else {
        this.$set(
          detail,
          'price',
          dividePrice(detail.totalPrice, detail.quantity)
        )
      }
    },
    handlePriceChange(detail) {
      this.$set(
        detail,
        'totalPrice',
        multiplyPrice(detail.quantity, detail.price)
      )
    },
    handleTotalPriceChange(detail) {
      this.$set(
        detail,
        'price',
        dividePrice(detail.totalPrice, detail.quantity)
      )
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (column.property === 'quantity') { return formatQuantity(sumQuantity(data, (item) => item.quantity)) }
        if (column.property === 'totalPrice') { return formatPrice(sumPrice(data, (item) => item.totalPrice)) }
        return ''
      })
    },
    validateDetails(required) {
      if (!this.formData.details.length) {
        if (required) {
          this.$modal.msgError('至少包含一条入库明细')
          return false
        }
        return true
      }
      const invalid = this.formData.details.findIndex(
        (item) => !item.skuId || !item.quantity || item.quantity <= 0
      )
      if (invalid >= 0) {
        this.$modal.msgError(
          '第 ' + (invalid + 1) + ' 行明细的商品规格和数量必须有效'
        )
        return false
      }
      return true
    },
    buildSubmitData() {
      const data = Object.assign({}, this.formData, {
        details: this.formData.details || []
      })
      Reflect.deleteProperty(data, 'totalQuantity')
      Reflect.deleteProperty(data, 'totalPrice')
      return data
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid || !this.validateDetails(false)) return
        this.loading = true
        const action =
          this.formType === 'create'
            ? ReceiptOrderApi.createReceiptOrder
            : ReceiptOrderApi.updateReceiptOrder
        action(this.buildSubmitData())
          .then(() => {
            this.$modal.msgSuccess(
              this.formType === 'create' ? '新增成功' : '修改成功'
            )
            this.visible = false
            this.$emit('success')
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    handleComplete() {
      this.$refs.form.validate((valid) => {
        if (!valid || !this.validateDetails(true)) return
        this.$modal
          .confirm('确认完成入库？完成后将更新库存。')
          .then(() => {
            this.loading = true
            const data = this.buildSubmitData()
            const save = JSON.stringify(data) !== this.originalFormData
              ? ReceiptOrderApi.updateReceiptOrder(data)
              : Promise.resolve()
            return save.then(() => ReceiptOrderApi.completeReceiptOrder(this.formData.id))
          })
          .then(() => {
            this.$modal.msgSuccess('入库成功')
            this.visible = false
            this.$emit('success')
          })
          .catch(() => {})
          .finally(() => {
            this.loading = false
          })
      })
    },
    handleCancel() {
      this.$modal
        .confirm('确认作废该入库单？作废后不可恢复。')
        .then(() => {
          this.loading = true
          return ReceiptOrderApi.cancelReceiptOrder(this.formData.id)
        })
        .then(() => {
          this.$modal.msgSuccess('作废成功')
          this.visible = false
          this.$emit('success')
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 12px;
}
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
.danger-text {
  color: #f56c6c;
}
</style>
