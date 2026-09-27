<template>
  <div class="wm-migrated">
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
              label="库存记录"
              prop="materialStockId"
            >
              <WmMaterialStockSelect
                v-model="formData.materialStockId"
                :item-id="formData.itemId"
                virtual-filter="only"
                @change="handleStockChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="数量"
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
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="入库仓库"
              prop="warehouseId"
            >
              <WmWarehouseSelect
                v-model="formData.warehouseId"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="库区"
              prop="locationId"
            >
              <WmWarehouseLocationSelect
                v-model="formData.locationId"
                :warehouse-id="formData.warehouseId"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="库位"
              prop="areaId"
            >
              <WmWarehouseAreaSelect
                v-model="formData.areaId"
                :location-id="formData.locationId"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="批次号">
              <el-input
                :value="formData.batchCode"
                disabled
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
  </div>
</template>

<script>
import { ref, reactive, toRefs, getCurrentInstance } from 'vue'
import { WmReturnIssueDetailApi } from '@/api/mes/wm/returnissue/detail'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmMaterialStockSelect from '@/views/mes/wm/materialstock/components/WmMaterialStockSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
export default {
  name: 'ReturnIssueDetailForm',
  components: { MdItemSelect, WmMaterialStockSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect },
  props: { 'issueId': { type: Number, required: true }},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const t = (...args) => vm.$t(...args) // 国际化
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    } // 消息弹窗
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formLoading = ref(false) // 表单的加载中
    const formType = ref('') // 表单的类型：create / update
    const currentLineId = ref() // 当前操作的行 ID
    const quantityMax = ref(undefined) // 数量上限（在库数量）
    const formRef = ref() // 表单 Ref
    const formData = ref({
      id: undefined,
      lineId: undefined,
      issueId: undefined,
      itemId: undefined,
      materialStockId: undefined,
      quantity: undefined,
      batchId: undefined,
      batchCode: undefined,
      warehouseId: undefined,
      locationId: undefined,
      areaId: undefined
    })
    const formRules = reactive({
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      materialStockId: [{ required: true, message: '请选择库存记录', trigger: 'change' }],
      quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }]
    })
    /** 库存选中回调 —— 自动回填仓库/库区/库位/批次/数量 */
    const handleStockChange = (stock) => {
      if (!stock) {
        formData.value.warehouseId = undefined
        formData.value.locationId = undefined
        formData.value.areaId = undefined
        formData.value.batchId = undefined
        formData.value.batchCode = undefined
        formData.value.quantity = undefined
        quantityMax.value = undefined
        return
      }
      formData.value.warehouseId = stock.warehouseId
      formData.value.locationId = stock.locationId
      formData.value.areaId = stock.areaId
      formData.value.batchId = stock.batchId
      formData.value.batchCode = stock.batchCode
      formData.value.quantity = stock.quantity
      quantityMax.value = stock.quantity
    }
    /** 打开弹窗 */
    const open = async(type, lineId, itemId, detailId) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加上架明细' : '编辑上架明细'
      formType.value = type
      currentLineId.value = lineId
      resetForm()
      // 修改时，设置数据
      if (detailId) {
        formLoading.value = true
        try {
          formData.value = (await WmReturnIssueDetailApi.getReturnIssueDetail(detailId)).data
        } finally {
          formLoading.value = false
        }
      } else if (itemId) {
        formData.value.itemId = itemId
      }
    }
    /** 提交表单 */
    const submitForm = async() => {
      // 校验表单
      await formRef.value.validate()
      // 提交请求
      formLoading.value = true
      try {
        const data = {
          ...formData.value,
          issueId: props.issueId,
          lineId: currentLineId.value
        }
        if (formType.value === 'create') {
          (await WmReturnIssueDetailApi.createReturnIssueDetail(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmReturnIssueDetailApi.updateReturnIssueDetail(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        // 发送操作成功的事件
        emit('success', currentLineId.value)
      } finally {
        formLoading.value = false
      }
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      formData.value = {
        id: undefined,
        lineId: undefined,
        issueId: undefined,
        itemId: undefined,
        materialStockId: undefined,
        quantity: undefined,
        batchId: undefined,
        batchCode: undefined,
        warehouseId: undefined,
        locationId: undefined,
        areaId: undefined
      }
      quantityMax.value = undefined;
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { ...toRefs(props), MdItemSelect, WmMaterialStockSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, currentLineId, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, handleStockChange, message, open, quantityMax, resetForm, submitForm, t }
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
