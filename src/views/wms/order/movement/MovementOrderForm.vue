<template>
  <Dialog
    :title="title"
    v-model="visible"
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
          label="移库单号"
          prop="no"
        ><el-input
          v-model="formData.no"
          maxlength="64"
          placeholder="请输入移库单号"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="来源仓库"
          prop="sourceWarehouseId"
        ><warehouse-select
          v-model="formData.sourceWarehouseId"
          @change="handleSourceWarehouseChange"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="目标仓库"
          prop="targetWarehouseId"
        ><warehouse-select
          v-model="formData.targetWarehouseId"
          @change="handleTargetWarehouseChange"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="单据日期"
          prop="orderTime"
        ><el-date-picker
          v-model="formData.orderTime"
          type="date"
          value-format="timestamp"
          style="width: 100%"
          placeholder="请选择单据日期"
        /></el-form-item></el-col>
        <el-col :span="16"><el-form-item
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
        <strong>移库明细</strong><el-tooltip
          content="请先选择来源仓库和目标仓库"
          :disabled="canAddDetail"
        ><span><el-button
          type="primary"
          plain
          size="mini"
          icon="el-icon-plus"
          :disabled="!canAddDetail"
          @click="openInventorySelect"
        >添加商品</el-button></span></el-tooltip>
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
          min-width="190"
        ><template slot-scope="scope"><div>{{ scope.row.itemName || "-" }}</div>
          <span class="sub-text">{{
            scope.row.itemCode || ""
          }}</span></template></el-table-column>
        <el-table-column
          label="规格"
          min-width="190"
        ><template slot-scope="scope"><div>{{ scope.row.skuName || "-" }}</div>
          <span class="sub-text">{{
            scope.row.skuCode || ""
          }}</span></template></el-table-column>
        <el-table-column
          label="可用库存"
          prop="availableQuantity"
          width="110"
          align="right"
        ><template slot-scope="scope">{{
          formatQuantity(scope.row.availableQuantity)
        }}</template></el-table-column>
        <el-table-column
          label="移库数量"
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
          width="145"
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
          width="145"
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
      <inventory-select
        ref="inventorySelect"
        :warehouse-id="formData.sourceWarehouseId"
        @change="handleInventorySelect"
      />
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    ><span class="footer-left"><el-button
      v-if="isSavedPrepareOrder"
      v-hasPermi="['wms:movement-order:complete']"
      type="success"
      :loading="loading"
      @click="handleComplete"
    >完成移库</el-button><el-button
      v-if="isSavedPrepareOrder"
      v-hasPermi="['wms:movement-order:cancel']"
      type="danger"
      :loading="loading"
      @click="handleCancel"
    >作废</el-button></span><span><el-button
      v-if="isPrepareOrder"
      type="primary"
      :loading="loading"
      @click="submitForm"
    >保 存</el-button><el-button @click="visible = false">取 消</el-button></span></span>
  </Dialog>
</template>

<script>
import { MovementOrderApi } from '@/api/wms/order/movement'
import {
  OrderStatusEnum,
  OrderUpdateStatusList
} from '@/views/wms/utils/constants'
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
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import InventorySelect from './components/InventorySelect.vue'
import Dialog from '@/components/Dialog'

export default {
  name: 'WmsMovementOrderForm',
  components: { Dialog, WarehouseSelect, InventorySelect },
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      originalFormData: '',
      QUANTITY_PRECISION,
      PRICE_PRECISION,
      formData: this.getDefaultForm(),
      rules: {
        no: [{ required: true, message: '移库单号不能为空', trigger: 'blur' }],
        orderTime: [
          { required: true, message: '单据日期不能为空', trigger: 'change' }
        ],
        sourceWarehouseId: [
          { required: true, message: '来源仓库不能为空', trigger: 'change' }
        ],
        targetWarehouseId: [
          { required: true, message: '目标仓库不能为空', trigger: 'change' }
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
    },
    canAddDetail() {
      return (
        !!this.formData.sourceWarehouseId &&
        !!this.formData.targetWarehouseId &&
        this.formData.sourceWarehouseId !== this.formData.targetWarehouseId
      )
    }
  },
  methods: {
    formatQuantity,
    formatPrice,
    getDefaultForm() {
      return {
        id: undefined,
        no: generateOrderNo('YK'),
        orderTime: undefined,
        status: OrderStatusEnum.PREPARE,
        sourceWarehouseId: undefined,
        targetWarehouseId: undefined,
        remark: undefined,
        details: []
      }
    },
    open(type, id) {
      this.visible = true
      this.formType = type || 'create'
      this.title = this.formType === 'update' ? '修改移库单' : '新增移库单'
      this.resetForm()
      if (id !== undefined && id !== null) {
        this.loading = true
        MovementOrderApi.getMovementOrder(id)
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
      } else {
        this.originalFormData = JSON.stringify(this.buildSubmitData())
      }
    },
    resetForm() {
      this.formData = this.getDefaultForm()
      this.originalFormData = ''
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    openInventorySelect() {
      this.$refs.inventorySelect.open(
        this.formData.details
          .map((item) =>
            item.skuId && item.sourceWarehouseId
              ? item.skuId + '-' + item.sourceWarehouseId
              : undefined
          )
          .filter(Boolean)
      )
    },
    handleInventorySelect(rows) {
      const selected = this.formData.details.map(
        (item) => item.skuId + '-' + item.sourceWarehouseId
      );
      (rows || []).forEach((row) => {
        const key = row.skuId + '-' + row.warehouseId
        if (!row.skuId || selected.indexOf(key) >= 0) return
        this.formData.details.push({
          itemId: row.itemId,
          itemCode: row.itemCode,
          itemName: row.itemName,
          unit: row.unit,
          skuId: row.skuId,
          skuCode: row.skuCode,
          skuName: row.skuName,
          sourceWarehouseId: row.warehouseId,
          sourceWarehouseName: row.warehouseName,
          targetWarehouseId: this.formData.targetWarehouseId,
          availableQuantity: row.availableQuantity,
          quantity: undefined,
          price: undefined,
          totalPrice: undefined
        })
        selected.push(key)
      })
    },
    handleSourceWarehouseChange() {
      this.formData.details = []
    },
    handleTargetWarehouseChange() {
      this.formData.details.forEach((item) => {
        this.$set(item, 'targetWarehouseId', this.formData.targetWarehouseId)
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
      if (this.formData.sourceWarehouseId === this.formData.targetWarehouseId) {
        this.$modal.msgError('来源仓库和目标仓库不能相同')
        return false
      }
      if (!this.formData.details.length) {
        if (required) {
          this.$modal.msgError('至少包含一条移库明细')
          return false
        }
        return true
      }
      for (let i = 0; i < this.formData.details.length; i++) {
        const detail = this.formData.details[i]
        if (!detail.quantity || detail.quantity <= 0) {
          this.$modal.msgError(`第 ${i + 1} 行明细移库数量必须大于 0`)
          return false
        }
        if (detail.availableQuantity !== undefined && detail.quantity > detail.availableQuantity) {
          this.$modal.msgError(`第 ${i + 1} 行明细移库数量不能大于可用库存`)
          return false
        }
      }
      return true
    },
    buildSubmitData() {
      const data = Object.assign({}, this.formData)
      Reflect.deleteProperty(data, 'totalQuantity')
      Reflect.deleteProperty(data, 'totalPrice')
      return data
    },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid || !this.validateDetails(false)) return
      this.loading = true
      try {
        const action =
          this.formType === 'create'
            ? MovementOrderApi.createMovementOrder
            : MovementOrderApi.updateMovementOrder
        await action(this.buildSubmitData())
        this.$modal.msgSuccess(
          this.formType === 'create' ? '新增成功' : '修改成功'
        )
        this.visible = false
        this.$emit('success')
      } finally {
        this.loading = false
      }
    },
    handleComplete() {
      this.$refs.form.validate((valid) => {
        if (!valid || !this.validateDetails(true)) return
        this.$modal
          .confirm('确认完成移库？完成后将更新库存。')
          .then(() => {
            this.loading = true
            const data = this.buildSubmitData()
            const save =
              JSON.stringify(data) !== this.originalFormData
                ? MovementOrderApi.updateMovementOrder(data)
                : Promise.resolve()
            return save.then(() =>
              MovementOrderApi.completeMovementOrder(this.formData.id)
            )
          })
          .then(() => {
            this.$modal.msgSuccess('移库成功')
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
        .confirm('确认作废该移库单？作废后不可恢复。')
        .then(() => {
          this.loading = true
          return MovementOrderApi.cancelMovementOrder(this.formData.id)
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
  justify-content: space-between;
  width: 100%;
}
.footer-left {
  display: inline-flex;
  gap: 8px;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
.danger-text {
  color: #f56c6c;
}
</style>
