<!-- WMS 盘库单表单 -->
<template>
  <div>
    <el-dialog
      title="选择盘库仓库"
      :visible.sync="warehouseDialogVisible"
      width="420px"
      append-to-body
    >
      <el-form
        ref="warehouseForm"
        :model="warehouseFormData"
        :rules="warehouseFormRules"
        label-width="80px"
      >
        <el-form-item
          label="仓库"
          prop="warehouseId"
        ><warehouse-select
          v-model="warehouseFormData.warehouseId"
          @change="handleWarehouseSelect"
        /></el-form-item>
      </el-form>
      <span slot="footer"><el-button
        type="primary"
        @click="handleStartCheck"
      >开始盘库</el-button><el-button @click="warehouseDialogVisible = false">取 消</el-button></span>
    </el-dialog>

    <el-dialog
      :title="title"
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
            label="盘库单号"
            prop="no"
          ><el-input
            v-model="formData.no"
            maxlength="64"
            placeholder="请输入盘库单号"
          /></el-form-item></el-col>
          <el-col :span="8"><el-form-item
            label="仓库"
            prop="warehouseId"
          ><warehouse-select
            v-model="formData.warehouseId"
            disabled
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
          <el-col :span="8"><el-form-item label="实际金额"><el-input
            :value="formatPrice(actualPrice)"
            disabled
          /></el-form-item></el-col>
          <el-col :span="16"><el-form-item
            label="备注"
            prop="remark"
          ><el-input
            v-model="formData.remark"
            maxlength="255"
            placeholder="请输入备注"
            type="textarea"
            :rows="3"
          /></el-form-item></el-col>
        </el-row>

        <div class="detail-head">
          <strong>盘库明细</strong><span><el-button
            type="primary"
            plain
            size="mini"
            icon="el-icon-download"
            :disabled="!formData.warehouseId"
            @click="handleImportAllInventory"
          >导入仓库库存</el-button><el-button
            type="primary"
            plain
            size="mini"
            icon="el-icon-plus"
            :disabled="!formData.warehouseId"
            @click="handleAddSkuInventory"
          >添加盘点商品</el-button></span>
        </div>
        <el-table
          :data="formData.details"
          border
          size="small"
          empty-text="暂无商品明细"
          show-summary
          :summary-method="getDetailSummaries"
        >
          <el-table-column
            label="商品信息"
            min-width="210"
          ><template slot-scope="scope"><div>{{ scope.row.itemName || "-" }}</div>
            <div
              v-if="scope.row.itemCode"
              class="sub-text"
            >
              商品编号：{{ scope.row.itemCode }}
            </div></template></el-table-column>
          <el-table-column
            label="规格信息"
            min-width="210"
          ><template slot-scope="scope"><div>{{ scope.row.skuName || "-" }}</div>
            <div
              v-if="scope.row.skuCode"
              class="sub-text"
            >
              规格编号：{{ scope.row.skuCode }}
            </div></template></el-table-column>
          <el-table-column
            label="账面库存"
            prop="quantity"
            width="120"
            align="right"
          ><template slot-scope="scope">{{
            formatQuantity(scope.row.quantity) || "-"
          }}</template></el-table-column>
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
            label="实际库存"
            prop="checkQuantity"
            width="160"
          ><template slot-scope="scope"><el-input-number
            v-model="scope.row.checkQuantity"
            :controls="false"
            :min="0"
            :precision="QUANTITY_PRECISION"
            style="width: 100%"
            placeholder="数量"
            @change="
              handleDetailCheckQuantityChange(scope.row)
            "
          /></template></el-table-column>
          <el-table-column
            label="实际金额(元)"
            prop="actualPrice"
            width="160"
          ><template slot-scope="scope"><el-input-number
            v-model="scope.row.actualPrice"
            :controls="false"
            :min="0"
            :precision="PRICE_PRECISION"
            style="width: 100%"
            placeholder="金额"
            @change="handleDetailActualPriceChange(scope.row)"
          /></template></el-table-column>
          <el-table-column
            label="盈亏数"
            width="120"
            align="right"
          ><template slot-scope="scope"><span :class="getLossClass(getDifferenceQuantity(scope.row))">{{
            formatQuantity(getDifferenceQuantity(scope.row))
          }}</span></template></el-table-column>
          <el-table-column
            label="实际盈亏金额(元)"
            width="160"
            align="right"
          ><template slot-scope="scope"><span :class="getLossClass(getDifferencePrice(scope.row))">{{
            formatPrice(getDifferencePrice(scope.row))
          }}</span></template></el-table-column>
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
        <item-sku-select
          ref="skuSelect"
          @change="handleSelectSku"
        />
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      ><span class="left-actions"><el-button
        v-if="isSavedPrepareOrder"
        v-hasPermi="['wms:check-order:complete']"
        type="success"
        :disabled="loading"
        @click="handleComplete"
      >完成盘库</el-button><el-button
        v-if="isSavedPrepareOrder"
        v-hasPermi="['wms:check-order:cancel']"
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
  </div>
</template>

<script>
import { CheckOrderApi } from '@/api/wms/order/check'
import { InventoryApi } from '@/api/wms/inventory'
import {
  OrderStatusEnum,
  OrderUpdateStatusList
} from '@/views/wms/utils/constants'
import {
  dividePrice,
  formatPrice,
  formatQuantity,
  formatSumPrice,
  formatSumQuantity,
  getLossClass,
  multiplyPrice,
  PRICE_PRECISION,
  QUANTITY_PRECISION,
  roundPrice,
  sumPrice,
  sumQuantity
} from '@/views/wms/utils/format'
import { generateOrderNo } from '@/views/wms/utils/order'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import ItemSkuSelect from '@/views/wms/md/item/sku/components/ItemSkuSelect.vue'

export default {
  name: 'WmsCheckOrderForm',
  components: { WarehouseSelect, ItemSkuSelect },
  data() {
    return {
      visible: false,
      warehouseDialogVisible: false,
      loading: false,
      title: '',
      formType: 'create',
      originalFormData: '',
      formData: this.getDefaultForm(),
      warehouseFormData: { warehouseId: undefined, warehouseName: undefined },
      rules: {
        no: [{ required: true, message: '盘库单号不能为空', trigger: 'blur' }],
        orderTime: [
          { required: true, message: '单据日期不能为空', trigger: 'change' }
        ],
        warehouseId: [
          { required: true, message: '仓库不能为空', trigger: 'change' }
        ]
      },
      warehouseFormRules: {
        warehouseId: [
          { required: true, message: '仓库不能为空', trigger: 'change' }
        ]
      },
      DICT_TYPE: {},
      OrderStatusEnum,
      OrderUpdateStatusList,
      PRICE_PRECISION,
      QUANTITY_PRECISION
    }
  },
  computed: {
    totalQuantity() {
      return sumQuantity(this.formData.details || [], (detail) =>
        this.getDifferenceQuantity(detail)
      )
    },
    totalPrice() {
      return sumPrice(this.formData.details || [], (detail) =>
        this.getBookPrice(detail)
      )
    },
    actualPrice() {
      return sumPrice(this.formData.details || [], (detail) =>
        this.getActualPrice(detail)
      )
    },
    differencePrice() {
      return roundPrice(this.actualPrice - this.totalPrice) || 0
    },
    isPrepareOrder() {
      return (
        !this.formData.id ||
        (this.formData.status !== undefined &&
          OrderUpdateStatusList.indexOf(Number(this.formData.status)) >= 0)
      )
    },
    isSavedPrepareOrder() {
      return (
        !!this.formData.id &&
        this.formData.status !== undefined &&
        OrderUpdateStatusList.indexOf(Number(this.formData.status)) >= 0
      )
    }
  },
  methods: {
    formatPrice,
    formatQuantity,
    getLossClass,
    getDefaultForm() {
      return {
        id: undefined,
        no: generateOrderNo('PK'),
        orderTime: this.today(),
        status: OrderStatusEnum.PREPARE,
        warehouseId: undefined,
        warehouseName: undefined,
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
    getDifferenceQuantity(detail) {
      return Number(detail.checkQuantity || 0) - Number(detail.quantity || 0)
    },
    getBookPrice(detail) {
      return multiplyPrice(detail.quantity, detail.price)
    },
    getActualPrice(detail) {
      return detail.actualPrice !== undefined && detail.actualPrice !== null
        ? detail.actualPrice
        : multiplyPrice(detail.checkQuantity, detail.price)
    },
    getDifferencePrice(detail) {
      if (detail.price === undefined || detail.price === null) return undefined
      return roundPrice(
        this.getDifferenceQuantity(detail) * Number(detail.price)
      )
    },
    open(type, id) {
      this.formType = type || 'create'
      if (this.formType === 'create') {
        this.visible = false
        this.resetForm()
        this.warehouseDialogVisible = true
        this.warehouseFormData = {
          warehouseId: undefined,
          warehouseName: undefined
        }
        this.$nextTick(
          () =>
            this.$refs.warehouseForm && this.$refs.warehouseForm.clearValidate()
        )
        return
      }
      this.visible = true
      this.title = '修改盘库单'
      this.resetForm()
      if (id === undefined || id === null) return
      this.loading = true
      return CheckOrderApi.getCheckOrder(id)
        .then((response) => {
          const order = Object.assign(
            this.getDefaultForm(),
            response.data
          )
          order.details = Array.isArray(order.details)
            ? order.details.map((item) =>
              Object.assign({}, item, {
                actualPrice: multiplyPrice(item.checkQuantity, item.price)
              })
            )
            : []
          this.formData = order
        })
        .finally(() => {
          this.loading = false
          this.originalFormData = JSON.stringify(this.buildSubmitData())
        })
    },
    handleStartCheck() {
      this.$refs.warehouseForm.validate((valid) => {
        if (!valid) return
        this.warehouseDialogVisible = false
        this.visible = true
        this.title = '新增盘库单'
        this.resetForm()
        this.formData.warehouseId = this.warehouseFormData.warehouseId
        this.formData.warehouseName = this.warehouseFormData.warehouseName
        this.originalFormData = JSON.stringify(this.buildSubmitData())
      })
    },
    handleWarehouseSelect(warehouse) {
      this.warehouseFormData.warehouseName = warehouse && warehouse.name
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
        inventoryId: inventory.id,
        warehouseId: inventory.warehouseId,
        warehouseName: inventory.warehouseName,
        quantity: inventory.availableQuantity,
        checkQuantity: inventory.availableQuantity,
        availableQuantity: inventory.availableQuantity,
        price: inventory.price,
        actualPrice: multiplyPrice(
          inventory.availableQuantity,
          inventory.price
        )
      }
    },
    buildZeroInventoryDetail(sku) {
      return {
        id: undefined,
        itemId: sku.itemId,
        itemCode: sku.itemCode,
        itemName: sku.itemName,
        unit: sku.unit,
        skuId: sku.id,
        skuCode: sku.code,
        skuName: sku.name,
        inventoryId: undefined,
        warehouseId: this.formData.warehouseId,
        warehouseName: this.formData.warehouseName,
        quantity: 0,
        checkQuantity: 0,
        availableQuantity: 0,
        price: sku.costPrice,
        actualPrice: 0
      }
    },
    normalizeDetails(details) {
      return (details || []).map((detail) =>
        Object.assign({}, detail, {
          actualPrice: multiplyPrice(detail.checkQuantity, detail.price)
        })
      )
    },
    handleImportAllInventory() {
      if (!this.formData.warehouseId) { return this.$modal.msgWarning('请先选择仓库') }
      const load = async () => {
        this.loading = true
        try {
          const response = await InventoryApi.getInventoryList({
            warehouseId: this.formData.warehouseId
          })
          this.applyInventoryList(response)
        } finally {
          this.loading = false
        }
      }
      const loadPromise =
        this.formData.details && this.formData.details.length
          ? this.$modal
            .confirm('导入仓库库存会覆盖当前盘库明细，是否继续？')
            .then(load)
          : load()
      return loadPromise
    },
    applyInventoryList(response) {
      const inventories = response.data
      this.formData.details = inventories.map((item) =>
        this.buildDetail(
          Object.assign({}, item, { availableQuantity: item.quantity })
        )
      )
    },
    handleAddSkuInventory() {
      if (!this.formData.warehouseId) { return this.$modal.msgWarning('请先选择仓库') }
      this.$refs.skuSelect.open(this.getSelectedSkuIds(), { multiple: false })
    },
    handleSelectSku(skus) {
      if (!skus || !skus.length) return
      this.loading = true
      InventoryApi.getInventoryList({ warehouseId: this.formData.warehouseId })
        .then((response) => {
          const inventories = response.data
          const map = {}
          inventories.forEach((item) => {
            if (item.skuId) map[item.skuId] = item
          })
          const selected = this.getSelectedSkuIds();
          (this.formData.details || (this.formData.details = [])).push(
            ...skus
              .filter((sku) => sku && sku.id && selected.indexOf(sku.id) < 0)
              .map((sku) =>
                map[sku.id]
                  ? this.buildDetail(
                    Object.assign({}, map[sku.id], {
                      availableQuantity: map[sku.id].quantity
                    })
                  )
                  : this.buildZeroInventoryDetail(sku)
              )
          )
        })
        .finally(() => {
          this.loading = false
        })
    },
    getSelectedSkuIds() {
      return (this.formData.details || [])
        .map((item) => item.skuId)
        .filter((id) => id !== undefined && id !== null)
    },
    handleDeleteDetail(index) {
      this.formData.details.splice(index, 1)
    },
    handleDetailCheckQuantityChange(detail) {
      if (detail.price !== undefined && detail.price !== null) {
        this.$set(
          detail,
          'actualPrice',
          multiplyPrice(detail.checkQuantity, detail.price)
        )
      } else {
        this.$set(
          detail,
          'price',
          dividePrice(detail.actualPrice, detail.checkQuantity)
        )
      }
    },
    handleDetailPriceChange(detail) {
      this.$set(
        detail,
        'actualPrice',
        multiplyPrice(detail.checkQuantity, detail.price)
      )
    },
    handleDetailActualPriceChange(detail) {
      this.$set(
        detail,
        'price',
        dividePrice(detail.actualPrice, detail.checkQuantity)
      )
    },
    getDetailSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (column.property === 'quantity') { return formatSumQuantity(data, (detail) => detail.quantity) }
        if (column.property === 'checkQuantity') { return formatSumQuantity(data, (detail) => detail.checkQuantity) }
        if (column.property === 'actualPrice') { return formatSumPrice(data, (detail) => this.getActualPrice(detail)) }
        if (column.property === 'differenceQuantity') { return formatQuantity(this.totalQuantity) }
        if (column.property === 'differencePrice') { return formatPrice(this.differencePrice) }
        return ''
      })
    },
    validateDetails(required) {
      if (!this.formData.details || !this.formData.details.length) {
        return !required
          ? true
          : (this.$modal.msgError('至少包含一条盘库明细'), false)
      }
      const invalid = this.formData.details.findIndex(
        (item) => item.checkQuantity === undefined || item.checkQuantity < 0
      )
      if (invalid >= 0) {
        this.$modal.msgError(
          '第 ' + (invalid + 1) + ' 行明细实盘数量不能小于 0'
        )
        return false
      }
      return true
    },
    buildSubmitData() {
      const order = Object.assign({}, this.formData)
      Reflect.deleteProperty(order, 'totalQuantity')
      Reflect.deleteProperty(order, 'totalPrice')
      Reflect.deleteProperty(order, 'actualPrice')
      order.details = (this.formData.details || []).map((detail) => {
        const item = Object.assign({}, detail)
        Reflect.deleteProperty(item, 'actualPrice')
        Reflect.deleteProperty(item, 'availableQuantity')
        return item
      })
      return order
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid || !this.validateDetails(false)) return
        this.loading = true
        const action =
          this.formType === 'create'
            ? CheckOrderApi.createCheckOrder
            : CheckOrderApi.updateCheckOrder
        action(this.buildSubmitData())
          .then(() => {
            this.$modal.msgSuccess(
              this.formType === 'create' ? '新增成功' : '修改成功'
            )
            this.visible = false
            this.$emit('success')
          })
          .catch(() => {})
          .finally(() => {
            this.loading = false
          })
      })
    },
    handleComplete() {
      this.$refs.form.validate((valid) => {
        if (!valid || !this.validateDetails(true)) return
        this.$modal
          .confirm('确认完成盘库？完成后将更新库存。')
          .then(() => {
            this.loading = true
            const data = this.buildSubmitData()
            const save =
              JSON.stringify(data) !== this.originalFormData
                ? CheckOrderApi.updateCheckOrder(data)
                : Promise.resolve()
            return save.then(() =>
              CheckOrderApi.completeCheckOrder(this.formData.id)
            )
          })
          .then(() => {
            this.$modal.msgSuccess('盘库成功')
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
        .confirm('确认作废该盘库单？作废后不可恢复。')
        .then(() => {
          this.loading = true
          return CheckOrderApi.cancelCheckOrder(this.formData.id)
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
    },
    resetForm() {
      this.formData = this.getDefaultForm()
      this.originalFormData = ''
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
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
  justify-content: space-between;
  align-items: center;
}
.left-actions {
  float: left;
}
</style>
