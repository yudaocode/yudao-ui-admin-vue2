<!-- WMS 出库单表单 -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="1280px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="92px"
    >
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item
          label="出库单号"
          prop="no"
        ><el-input
          v-model="formData.no"
          maxlength="64"
          placeholder="请输入出库单号"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="出库类型"
          prop="type"
        ><el-select
          v-model="formData.type"
          style="width: 100%"
          placeholder="请选择出库类型"
        ><el-option
          v-for="dict in shipmentTypeDictDatas"
          :key="dict.value"
          :label="dict.label"
          :value="Number(dict.value)"
        /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="仓库"
          prop="warehouseId"
        ><warehouse-select
          v-model="formData.warehouseId"
          @change="handleWarehouseChange"
        /></el-form-item></el-col>
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
          label="客户"
          prop="merchantId"
        ><merchant-select
          v-model="formData.merchantId"
          customer
          placeholder="请选择客户"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="业务单号"
          prop="bizOrderNo"
        ><el-input
          v-model="formData.bizOrderNo"
          maxlength="64"
          placeholder="请输入业务单号"
        /></el-form-item></el-col>
        <el-col :span="16"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          maxlength="255"
          placeholder="请输入备注"
        /></el-form-item></el-col>
      </el-row>

      <div class="detail-head">
        <strong>出库明细</strong>
        <el-tooltip
          content="请先选择仓库"
          :disabled="!!formData.warehouseId"
          placement="top"
        >
          <span><el-button
            type="primary"
            plain
            size="mini"
            icon="el-icon-plus"
            :disabled="!formData.warehouseId"
            @click="handleAddDetail"
          >添加商品</el-button></span>
        </el-tooltip>
      </div>
      <el-table
        :data="formData.details"
        border
        show-summary
        empty-text="暂无商品明细"
        :summary-method="getDetailSummaries"
      >
        <el-table-column
          label="商品信息"
          min-width="220"
        ><template slot-scope="scope"><div>{{ scope.row.itemName || "-" }}</div>
          <div
            v-if="scope.row.itemCode"
            class="sub-text"
          >
            商品编号：{{ scope.row.itemCode }}
          </div></template></el-table-column>
        <el-table-column
          label="规格信息"
          min-width="220"
        ><template slot-scope="scope"><div>{{ scope.row.skuName || "-" }}</div>
          <div
            v-if="scope.row.skuCode"
            class="sub-text"
          >
            规格编号：{{ scope.row.skuCode }}
          </div></template></el-table-column>
        <el-table-column
          label="可用库存"
          width="120"
          align="right"
        ><template slot-scope="scope">{{
          formatQuantity(scope.row.availableQuantity) || "-"
        }}</template></el-table-column>
        <el-table-column
          label="出库数量"
          prop="quantity"
          width="160"
        ><template slot-scope="scope"><el-input-number
          v-model="scope.row.quantity"
          :controls="false"
          :min="0"
          :precision="QUANTITY_PRECISION"
          style="width: 100%"
          placeholder="数量"
          @change="handleDetailQuantityChange(scope.row)"
        /></template></el-table-column>
        <el-table-column
          label="单价(元)"
          prop="price"
          width="160"
        ><template slot-scope="scope"><el-input-number
          v-model="scope.row.price"
          :controls="false"
          :min="0"
          :precision="PRICE_PRECISION"
          style="width: 100%"
          placeholder="单价"
          @change="handleDetailPriceChange(scope.row)"
        /></template></el-table-column>
        <el-table-column
          label="金额(元)"
          prop="totalPrice"
          width="160"
        ><template slot-scope="scope"><el-input-number
          v-model="scope.row.totalPrice"
          :controls="false"
          :min="0"
          :precision="PRICE_PRECISION"
          style="width: 100%"
          placeholder="金额"
          @change="handleDetailTotalPriceChange(scope.row)"
        /></template></el-table-column>
        <el-table-column
          label="操作"
          width="70"
          align="center"
        ><template slot-scope="scope"><el-button
          type="text"
          class="danger-text"
          @click="handleDeleteDetail(scope.$index)"
        >删除</el-button></template></el-table-column>
      </el-table>
      <shipment-inventory-select
        ref="inventorySelect"
        :warehouse-id="formData.warehouseId"
        @change="handleSelectInventory"
      />
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <span class="footer-left">
        <el-button
          v-if="isSavedPrepareOrder"
          v-hasPermi="['wms:shipment-order:complete']"
          type="success"
          :disabled="loading"
          @click="handleComplete"
        >完成出库</el-button>
        <el-button
          v-if="isSavedPrepareOrder"
          v-hasPermi="['wms:shipment-order:cancel']"
          type="danger"
          :disabled="loading"
          @click="handleCancel"
        >作废</el-button>
      </span>
      <span>
        <el-button
          v-if="isPrepareOrder"
          type="primary"
          :loading="loading"
          @click="submitForm"
        >保 存</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </span>
    </span>
  </el-dialog>
</template>

<script>
import { ShipmentOrderApi } from '@/api/wms/order/shipment'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  OrderStatusEnum,
  OrderUpdateStatusList
} from '@/views/wms/utils/constants'
import {
  dividePrice,
  formatQuantity,
  formatSumPrice,
  formatSumQuantity,
  multiplyPrice,
  PRICE_PRECISION,
  QUANTITY_PRECISION
} from '@/views/wms/utils/format'
import { generateOrderNo } from '@/views/wms/utils/order'
import MerchantSelect from '@/views/wms/md/merchant/components/MerchantSelect.vue'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import ShipmentInventorySelect from './ShipmentInventorySelect.vue'

export default {
  name: 'WmsShipmentOrderForm',
  components: { MerchantSelect, WarehouseSelect, ShipmentInventorySelect },
  data() {
    return {
      DICT_TYPE,
      QUANTITY_PRECISION,
      PRICE_PRECISION,
      visible: false,
      loading: false,
      dialogTitle: '',
      formType: 'create',
      originalFormData: '',
      formData: this.getDefaultForm(),
      rules: {
        no: [{ required: true, message: '出库单号不能为空', trigger: 'blur' }],
        type: [
          { required: true, message: '出库类型不能为空', trigger: 'change' }
        ],
        orderTime: [
          { required: true, message: '单据日期不能为空', trigger: 'change' }
        ],
        warehouseId: [
          { required: true, message: '仓库不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    shipmentTypeDictDatas() {
      return getDictDatas(DICT_TYPE.WMS_SHIPMENT_ORDER_TYPE)
    },
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
    getDefaultForm() {
      return {
        id: undefined,
        no: generateOrderNo('CK'),
        type: undefined,
        orderTime: this.today(),
        status: OrderStatusEnum.PREPARE,
        bizOrderNo: undefined,
        merchantId: undefined,
        warehouseId: undefined,
        remark: undefined,
        details: []
      }
    },
    today() {
      const date = new Date()
      return (
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0') +
        ' 00:00:00'
      )
    },
    open(type, id) {
      this.visible = true
      this.formType = type || 'create'
      this.dialogTitle =
        this.formType === 'update' ? '修改出库单' : '新增出库单'
      this.resetForm()
      if (id === undefined || id === null) {
        this.originalFormData = JSON.stringify(this.buildSubmitData())
        return Promise.resolve()
      }
      this.loading = true
      return ShipmentOrderApi.getShipmentOrder(id)
        .then((response) => {
          const data = Object.assign(
            this.getDefaultForm(),
            response.data
          )
          data.details = Array.isArray(data.details)
            ? this.normalizeDetails(data.details)
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
    buildDetail(inventory) {
      return {
        id: undefined,
        itemId: inventory.itemId,
        itemCode: inventory.itemCode,
        itemName: inventory.itemName,
        unit: inventory.unit,
        skuId: inventory.skuId,
        skuCode: inventory.skuCode,
        skuName: inventory.skuName,
        warehouseId: inventory.warehouseId || this.formData.warehouseId,
        warehouseName: inventory.warehouseName,
        quantity: undefined,
        availableQuantity:
          inventory.availableQuantity === undefined
            ? inventory.quantity
            : inventory.availableQuantity,
        price: undefined,
        totalPrice: undefined
      }
    },
    normalizeDetails(details) {
      return details.map((detail) =>
        Object.assign({}, detail, {
          totalPrice:
            detail.totalPrice == null
              ? multiplyPrice(detail.quantity, detail.price)
              : detail.totalPrice
        })
      )
    },
    handleAddDetail() {
      this.$refs.inventorySelect.open(this.getSelectedInventoryKeys())
    },
    handleSelectInventory(inventories) {
      this.formData.details = this.formData.details || [];
      (inventories || []).forEach((inventory) => {
        if (!inventory || this.isInventorySelected(inventory)) return
        this.formData.details.push(this.buildDetail(inventory))
      })
    },
    isInventorySelected(inventory) {
      return (this.formData.details || []).some(
        (detail) =>
          detail.skuId === inventory.skuId &&
          detail.warehouseId ===
            (inventory.warehouseId || this.formData.warehouseId)
      )
    },
    getSelectedInventoryKeys() {
      return (this.formData.details || [])
        .map((detail) =>
          detail.skuId && detail.warehouseId
            ? detail.skuId + '-' + detail.warehouseId
            : undefined
        )
        .filter(Boolean)
    },
    handleDeleteDetail(index) {
      this.formData.details.splice(index, 1)
    },
    handleWarehouseChange() {
      this.formData.details = []
    },
    handleDetailQuantityChange(detail) {
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
    handleDetailPriceChange(detail) {
      this.$set(
        detail,
        'totalPrice',
        multiplyPrice(detail.quantity, detail.price)
      )
    },
    handleDetailTotalPriceChange(detail) {
      this.$set(
        detail,
        'price',
        dividePrice(detail.totalPrice, detail.quantity)
      )
    },
    getDetailSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (column.property === 'quantity') { return formatSumQuantity(data, (item) => item.quantity) }
        if (column.property === 'totalPrice') { return formatSumPrice(data, (item) => item.totalPrice) }
        return ''
      })
    },
    validateDetails(required) {
      if (!this.formData.details || !this.formData.details.length) {
        if (required) {
          this.$modal.msgError('至少包含一条出库明细')
          return false
        }
        return true
      }
      for (let index = 0; index < this.formData.details.length; index++) {
        const detail = this.formData.details[index]
        if (!detail.skuId) {
          this.$modal.msgError('第 ' + (index + 1) + ' 行明细请选择商品规格')
          return false
        }
        if (!detail.quantity || detail.quantity <= 0) {
          this.$modal.msgError(
            '第 ' + (index + 1) + ' 行明细出库数量必须大于 0'
          )
          return false
        }
        if (
          detail.availableQuantity !== undefined &&
          detail.availableQuantity !== null &&
          detail.quantity > detail.availableQuantity
        ) {
          this.$modal.msgError(
            '第 ' + (index + 1) + ' 行明细出库数量不能大于可用库存'
          )
          return false
        }
      }
      return true
    },
    buildSubmitData() {
      const order = Object.assign({}, this.formData)
      Reflect.deleteProperty(order, 'totalQuantity')
      Reflect.deleteProperty(order, 'totalPrice')
      order.details = (this.formData.details || []).map((detail) =>
        Object.assign({}, detail)
      )
      return order
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid || !this.validateDetails(false)) return
        this.loading = true
        const action =
          this.formType === 'create'
            ? ShipmentOrderApi.createShipmentOrder
            : ShipmentOrderApi.updateShipmentOrder
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
          .confirm('确认完成出库？完成后将更新库存。')
          .then(() => {
            this.loading = true
            const data = this.buildSubmitData()
            const savePromise =
              JSON.stringify(data) !== this.originalFormData
                ? ShipmentOrderApi.updateShipmentOrder(data)
                : Promise.resolve()
            return savePromise.then(() =>
              ShipmentOrderApi.completeShipmentOrder(this.formData.id)
            )
          })
          .then(() => {
            this.$modal.msgSuccess('出库成功')
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
        .confirm('确认作废该出库单？作废后不可恢复。')
        .then(() => {
          this.loading = true
          return ShipmentOrderApi.cancelShipmentOrder(this.formData.id)
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
.sub-text {
  color: #909399;
  font-size: 12px;
}
.danger-text {
  color: #f56c6c;
}
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-left {
  display: inline-flex;
  gap: 8px;
}
</style>
