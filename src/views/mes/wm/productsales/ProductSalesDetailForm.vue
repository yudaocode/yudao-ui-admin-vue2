<template>
  <Dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="960px"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row>
        <el-col :span="8"><el-form-item
          label="物料"
          prop="itemId"
        ><MdItemSelect
          v-model="formData.itemId"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="选择库存"
          prop="materialStockId"
        ><ProductSalesMaterialStockSelect
          v-model="formData.materialStockId"
          :item-id="formData.itemId"
          :batch-id="formData.batchId"
          @change="handleStockChange"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="数量"
          prop="quantity"
        ><el-input-number
          v-model="formData.quantity"
          :precision="2"
          :min="0"
          :max="quantityMax"
          controls-position="right"
          style="width: 100%"
        /></el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="8"><el-form-item
          label="出库仓库"
          prop="warehouseId"
        ><WmWarehouseSelect
          v-model="formData.warehouseId"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="库区"
          prop="locationId"
        ><WmWarehouseLocationSelect
          v-model="formData.locationId"
          :warehouse-id="formData.warehouseId"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="库位"
          prop="areaId"
        ><WmWarehouseAreaSelect
          v-model="formData.areaId"
          :location-id="formData.locationId"
          disabled
        /></el-form-item></el-col>
      </el-row>
      <el-row><el-col :span="8"><el-form-item
        label="批次号"
        prop="batchId"
      ><WmBatchSelect
        v-model="formData.batchId"
        :item-id="formData.itemId"
        @change="handleBatchChange"
        disabled
      /></el-form-item></el-col></el-row>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    ><el-button
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </Dialog>
</template>

<script>
import { WmProductSalesDetailApi } from '@/api/mes/wm/productsales/detail'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
import ProductSalesMaterialStockSelect from './components/ProductSalesMaterialStockSelect.vue'
import WmBatchSelect from '@/views/mes/wm/batch/components/WmBatchSelect.vue'
import Dialog from '@/components/Dialog/index.vue'

function defaultFormData() {
  return {
    id: undefined, lineId: undefined, salesId: undefined, itemId: undefined, quantity: undefined,
    materialStockId: undefined, warehouseId: undefined,
    locationId: undefined, areaId: undefined,
    batchId: undefined, batchCode: undefined
  }
}

export default {
  name: 'ProductSalesDetailForm',
  components: {
    Dialog,
    WmBatchSelect,
    MdItemSelect,
    WmWarehouseSelect,
    WmWarehouseLocationSelect,
    WmWarehouseAreaSelect,
    ProductSalesMaterialStockSelect
  },
  props: { salesId: { type: Number, required: true }},
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      currentLineId: undefined,
      formData: defaultFormData(),
      quantityMax: undefined,
      formRules: {
        itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
        materialStockId: [{ required: true, message: '请选择库存记录', trigger: 'change' }],
        quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    resetForm() {
      this.formData = defaultFormData()
      this.quantityMax = undefined
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    async open(type, lineId, itemId, detailId) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '添加拣货明细' : '编辑拣货明细'
      this.formType = type
      this.currentLineId = lineId
      this.resetForm()
      if (detailId) {
        this.formLoading = true
        try {
          const response = await WmProductSalesDetailApi.getProductSalesDetail(detailId)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      } else if (itemId) {
        this.formData.itemId = itemId
      }
    },
    handleBatchChange(batch) {
      this.formData.batchCode = batch?.code
    },
    handleStockChange(stock) {
      if (!stock) {
        this.formData.warehouseId = undefined
        this.formData.locationId = undefined
        this.formData.areaId = undefined
        this.formData.batchId = undefined
        this.formData.batchCode = undefined
        this.formData.quantity = undefined
        this.quantityMax = undefined
        return
      }
      this.formData.warehouseId = stock.warehouseId
      this.formData.locationId = stock.locationId
      this.formData.areaId = stock.areaId
      this.formData.batchId = stock.batchId
      this.formData.batchCode = stock.batchCode
      this.formData.quantity = stock.quantity
      this.quantityMax = stock.quantity
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        const data = Object.assign({}, this.formData, { salesId: this.salesId, lineId: this.currentLineId })
        if (this.formType === 'create') {
          await WmProductSalesDetailApi.createProductSalesDetail(data)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await WmProductSalesDetailApi.updateProductSalesDetail(data)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success', this.currentLineId)
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
