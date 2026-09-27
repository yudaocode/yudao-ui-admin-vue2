<template>
  <div class="wm-migrated">
    <div>
      <el-button
        v-if="isUpdate"
        type="primary"
        plain
        class="mb-10px"
        @click="openForm('create')"
      >
        <i class="el-icon-plus mr-5px" /> 添加调拨物料
      </el-button>
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        border
        :row-key="(row) => row.id"
      >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <TransferDetailList
              :ref="(el) => setDetailListRef(scope.row.id, el)"
              :transfer-id="transferId"
              :line-id="scope.row.id"
              :item-id="scope.row.itemId"
              :line-quantity="scope.row.quantity"
              :form-type="formType"
              @edit-detail="
                (detailId) =>
                  openDetailForm('update', scope.row.id, scope.row.itemId, detailId)
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          label="物料编码"
          align="center"
          prop="itemCode"
          min-width="120"
        />
        <el-table-column
          label="物料名称"
          align="center"
          prop="itemName"
          min-width="140"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="specification"
          min-width="120"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitMeasureName"
          width="80"
        />
        <el-table-column
          label="转移数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          min-width="120"
        />
        <el-table-column
          label="移出仓库"
          align="center"
          prop="fromWarehouseName"
          min-width="120"
        />
        <el-table-column
          label="移出库区"
          align="center"
          prop="fromLocationName"
          min-width="120"
        />
        <el-table-column
          label="移出库位"
          align="center"
          prop="fromAreaName"
          min-width="120"
        />
        <el-table-column
          v-if="isUpdate || isStock"
          label="操作"
          align="center"
          width="180"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="isUpdate"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-if="isUpdate"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              v-if="isStock"
              type="text"
              @click="handleStock(scope.row.id)"
            >
              上架
            </el-button>
            <PrinterLabel
              v-if="isStock"
              :biz-id="scope.row.batchId"
              :biz-code="scope.row.batchCode"
              biz-type="BATCH"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="1080px"
      append-to-body
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="110px"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="选择库存"
              prop="materialStockId"
            >
              <WmMaterialStockSelect
                v-model="formData.materialStockId"
                class="wm-w-full"
                @change="handleStockChange"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.itemId"
            :span="8"
          >
            <el-form-item
              label="物料"
              prop="itemId"
            >
              <MdItemSelect
                v-model="formData.itemId"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="转移数量"
              prop="quantity"
            >
              <el-input-number
                v-model="formData.quantity"
                :precision="2"
                :min="0"
                :max="quantityMax"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="批次号">
              <el-input
                v-model="formData.batchCode"
                placeholder="请输入批次号"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="移出仓库"
              prop="fromWarehouseId"
            >
              <WmWarehouseSelect
                v-model="formData.fromWarehouseId"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="移出库区"
              prop="fromLocationId"
            >
              <WmWarehouseLocationSelect
                v-model="formData.fromLocationId"
                :warehouse-id="formData.fromWarehouseId"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="移出库位"
              prop="fromAreaId"
            >
              <WmWarehouseAreaSelect
                v-model="formData.fromAreaId"
                :location-id="formData.fromLocationId"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="备注"
              prop="remark"
            >
              <el-input
                v-model="formData.remark"
                type="textarea"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button
          type="primary"
          :disabled="formLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <TransferDetailForm
      ref="detailFormRef"
      :transfer-id="transferId"
      @success="onDetailFormSuccess"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, toRefs, getCurrentInstance } from 'vue'
import { WmTransferLineApi } from '@/api/mes/wm/transfer/line'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
import WmMaterialStockSelect from '@/views/mes/wm/materialstock/components/WmMaterialStockSelect.vue'
import { WmMaterialStockApi } from '@/api/mes/wm/materialstock'
import TransferDetailList from './TransferDetailList.vue'
import TransferDetailForm from './TransferDetailForm.vue'
import { PrinterLabel } from '@/views/mes/wm/barcode/components'
export default {
  name: 'TransferLineList',
  components: { MdItemSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect, WmMaterialStockSelect, TransferDetailList, TransferDetailForm, PrinterLabel },
  props: { 'transferId': { type: Number, required: true }, 'formType': { type: String, required: true }},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const t = (...args) => vm.$t(...args)
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    }
    const isUpdate = computed(() => ['create', 'update'].includes(props.formType))
    const isStock = computed(() => props.formType === 'stock')
    // ==================== 列表 ====================
    const loading = ref(false)
    const list = ref([])
    /** 查询行列表 */
    const getList = async() => {
      loading.value = true
      try {
        list.value = (await WmTransferLineApi.getTransferLineList(props.transferId)).data
      } finally {
        loading.value = false
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await WmTransferLineApi.deleteTransferLine(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    // ==================== 添加/编辑表单 ====================
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formLoading = ref(false)
    const lineFormType = ref('')
    const formData = ref({
      id: undefined,
      transferId: undefined,
      materialStockId: undefined,
      itemId: undefined,
      itemCode: undefined,
      itemName: undefined,
      specification: undefined,
      unitMeasureName: undefined,
      quantity: undefined,
      batchId: undefined,
      batchCode: undefined,
      fromWarehouseId: undefined,
      fromWarehouseName: undefined,
      fromLocationId: undefined,
      fromLocationName: undefined,
      fromAreaId: undefined,
      fromAreaName: undefined,
      remark: undefined
    })
    const formRules = reactive({
      materialStockId: [{ required: true, message: '请选择库存', trigger: 'change' }],
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      quantity: [{ required: true, message: '转移数量不能为空', trigger: 'blur' }],
      fromWarehouseId: [{ required: true, message: '移出仓库不能为空', trigger: 'change' }],
      fromLocationId: [{ required: true, message: '移出库区不能为空', trigger: 'change' }],
      fromAreaId: [{ required: true, message: '移出库位不能为空', trigger: 'change' }]
    })
    const formRef = ref()
    const quantityMax = ref(undefined)
    /** 库存选中回来，自动回填属性 */
    const handleStockChange = (stock) => {
      if (!stock) {
        formData.value.itemId = undefined
        formData.value.fromWarehouseId = undefined
        formData.value.fromLocationId = undefined
        formData.value.fromAreaId = undefined
        formData.value.batchId = undefined
        formData.value.batchCode = undefined
        formData.value.quantity = undefined
        quantityMax.value = undefined
        return
      }
      formData.value.itemId = stock.itemId
      formData.value.fromWarehouseId = stock.warehouseId
      formData.value.fromLocationId = stock.locationId
      formData.value.fromAreaId = stock.areaId
      formData.value.batchId = stock.batchId
      formData.value.batchCode = stock.batchCode
      formData.value.quantity = stock.quantity
      quantityMax.value = stock.quantity
    }
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加调拨物料' : '编辑调拨物料'
      lineFormType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmTransferLineApi.getTransferLine(id)).data
          // 编辑时：如果行关联了库存台账，查询当前在库量作为数量上限
          if (formData.value.materialStockId) {
            try {
              const stock = (await WmMaterialStockApi.getMaterialStock(formData.value.materialStockId)).data
              quantityMax.value = stock === null || stock === void 0 ? void 0 : stock.quantity
            } catch {
              // 台账记录可能已不存在，不限制上限
              quantityMax.value = undefined
            }
          }
        } finally {
          formLoading.value = false
        }
      }
    }
    /** 提交表单 */
    const submitForm = async() => {
      await formRef.value.validate()
      formLoading.value = true
      try {
        const data = { ...formData.value, transferId: props.transferId }
        if (lineFormType.value === 'create') {
          (await WmTransferLineApi.createTransferLine(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmTransferLineApi.updateTransferLine(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        await getList()
      } finally {
        formLoading.value = false
      }
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      formData.value = {
        id: undefined,
        transferId: undefined,
        materialStockId: undefined,
        itemId: undefined,
        itemCode: undefined,
        itemName: undefined,
        specification: undefined,
        unitMeasureName: undefined,
        quantity: undefined,
        batchId: undefined,
        batchCode: undefined,
        fromWarehouseId: undefined,
        fromWarehouseName: undefined,
        fromLocationId: undefined,
        fromLocationName: undefined,
        fromAreaId: undefined,
        fromAreaName: undefined,
        remark: undefined
      }
      quantityMax.value = undefined;
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    // ==================== 展开行：上架明细 ====================
    const detailListRefs = ref({})
    /** 缓存子组件 ref */
    const setDetailListRef = (lineId, el) => {
      if (el) {
        detailListRefs.value[lineId] = el
      }
    }
    // ==================== 上架明细表单（LineList 层级持有） ====================
    const detailFormRef = ref()
    /** 上架：直接打开明细创建表单 */
    const handleStock = (lineId) => {
      const row = list.value.find((r) => r.id === lineId)
      openDetailForm('create', lineId, row === null || row === void 0 ? void 0 : row.itemId)
    }
    /** 打开上架明细表单 */
    const openDetailForm = (type, lineId, itemId, detailId) => {
      detailFormRef.value.open(type, lineId, itemId, detailId)
    }
    /** 明细表单提交成功后，刷新已展开行的 DetailList */
    const onDetailFormSuccess = (lineId) => {
      var _a;
      (_a = detailListRefs.value[lineId]) === null || _a === void 0 ? void 0 : _a.getList()
    }
    onMounted(async() => {
      await getList()
    })
    return { ...toRefs(props), MdItemSelect, PrinterLabel, TransferDetailForm, TransferDetailList, WmMaterialStockSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, detailFormRef, detailListRefs, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleDelete, handleStock, handleStockChange, isStock, isUpdate, lineFormType, list, loading, message, onDetailFormSuccess, openDetailForm, openForm, quantityMax, resetForm, setDetailListRef, submitForm, t }
  }
}
</script>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
</style>
