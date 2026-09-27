<template>
  <div class="wm-migrated">
    <div class="overflow-hidden">
      <el-button
        v-if="isUpdate"
        type="primary"
        plain
        class="mb-10px"
        @click="openForm('create')"
      >
        <i class="el-icon-plus mr-5px" /> 添加物料
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
            <ProductReceiptDetailList
              :ref="(el) => setDetailListRef(scope.row.id, el)"
              :receipt-id="receiptId"
              :line-id="scope.row.id"
              :item-id="scope.row.itemId"
              :form-type="formType"
              @edit-detail="
                (detailId) =>
                  openDetailForm('update', scope.row.id, scope.row.itemId, detailId)
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          label="产品物料编码"
          align="center"
          prop="itemCode"
          min-width="120"
        />
        <el-table-column
          label="产品物料名称"
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
          label="入库数量"
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
          v-if="isUpdate || isStock"
          label="操作"
          align="center"
          width="200"
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
            <el-button
              type="text"
              @click="handleBarcode(scope.row)"
            > 条码 </el-button>
            <PrinterLabel
              v-if="isStock"
              :biz-id="scope.row.batchId"
              :biz-code="scope.row.batchCode"
              biz-type="BATCH"
            />
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 添加/编辑行弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="960px"
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
              label="库存记录"
              prop="materialStockId"
            >
              <WmMaterialStockSelect
                v-model="formData.materialStockId"
                placeholder="请选择库存"
                class="wm-w-full"
                virtual-filter="only"
                @change="handleStockChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="入库数量"
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
                :value="formData.batchCode"
                disabled
                placeholder="选择库存后自动带出"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="物料">
              <MdItemSelect
                v-model="formData.itemId"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
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

    <!-- 上架明细添加/编辑弹窗 -->
    <ProductReceiptDetailForm
      ref="detailFormRef"
      :receipt-id="receiptId"
      @success="onDetailFormSuccess"
    />
    <!-- 条码详情弹窗 -->
    <BarcodeDetail ref="barcodeDetailRef" />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, toRefs, getCurrentInstance } from 'vue'
import { WmProductReceiptLineApi } from '@/api/mes/wm/productreceipt/line'
import WmMaterialStockSelect from '@/views/mes/wm/materialstock/components/WmMaterialStockSelect.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import ProductReceiptDetailList from './ProductReceiptDetailList.vue'
import ProductReceiptDetailForm from './ProductReceiptDetailForm.vue'
import { BarcodeDetail, PrinterLabel } from '@/views/mes/wm/barcode/components'
import { BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
export default {
  name: 'ProductReceiptLineList',
  components: { WmMaterialStockSelect, MdItemSelect, ProductReceiptDetailList, ProductReceiptDetailForm, BarcodeDetail, PrinterLabel },
  props: { 'receiptId': { type: Number, required: true }, 'formType': { type: String, required: true }},
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
    const total = ref(0)
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      receiptId: undefined
    })
    /** 查询行列表 */
    const getList = async() => {
      loading.value = true
      try {
        queryParams.receiptId = props.receiptId
        const data = (await WmProductReceiptLineApi.getProductReceiptLinePage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await WmProductReceiptLineApi.deleteProductReceiptLine(id)).data
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
    const quantityMax = ref(undefined)
    const formData = ref({
      id: undefined,
      receiptId: undefined,
      materialStockId: undefined,
      itemId: undefined,
      quantity: undefined,
      batchId: undefined,
      batchCode: undefined,
      remark: undefined
    })
    const formRules = reactive({
      materialStockId: [{ required: true, message: '请选择库存记录', trigger: 'change' }],
      quantity: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }]
    })
    const formRef = ref()
    /** 库存选中回调 —— 自动回填物料ID/批次/数量上限 */
    const handleStockChange = (stock) => {
      if (!stock) {
        formData.value.itemId = undefined
        formData.value.batchId = undefined
        formData.value.batchCode = undefined
        formData.value.quantity = undefined
        quantityMax.value = undefined
        return
      }
      formData.value.itemId = stock.itemId
      formData.value.batchId = stock.batchId
      formData.value.batchCode = stock.batchCode
      formData.value.quantity = stock.quantity
      quantityMax.value = stock.quantity
    }
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加物料入库单行' : '修改物料入库单行'
      lineFormType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmProductReceiptLineApi.getProductReceiptLine(id)).data
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
        const data = {
          ...formData.value,
          receiptId: props.receiptId
        }
        if (lineFormType.value === 'create') {
          (await WmProductReceiptLineApi.createProductReceiptLine(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmProductReceiptLineApi.updateProductReceiptLine(data)).data
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
        receiptId: undefined,
        materialStockId: undefined,
        itemId: undefined,
        quantity: undefined,
        batchId: undefined,
        batchCode: undefined,
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
    /** 查看物料条码 */
    const barcodeDetailRef = ref()
    const handleBarcode = async(row) => {
      // 产品入库使用物料 ID 作为业务 ID
      await barcodeDetailRef.value.openByBusiness(row.itemId, BarcodeBizTypeEnum.ITEM, row.itemCode, row.itemName)
    }
    /** 初始化 */
    onMounted(async() => {
      await getList()
    })
    return { ...toRefs(props), BarcodeDetail, MdItemSelect, PrinterLabel, ProductReceiptDetailForm, ProductReceiptDetailList, WmMaterialStockSelect, barcodeDetailRef, detailFormRef, detailListRefs, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleBarcode, handleDelete, handleStock, handleStockChange, isStock, isUpdate, lineFormType, list, loading, message, onDetailFormSuccess, openDetailForm, openForm, quantityMax, queryParams, resetForm, setDetailListRef, submitForm, t, total }
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
