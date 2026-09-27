<template>
  <div class="wm-migrated">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      append-to-body
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="110px"
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
        <el-form-item
          label="批次号"
          prop="batchCode"
        >
          <el-input
            v-model="formData.batchCode"
            placeholder="请输入批次号"
          />
        </el-form-item>
        <el-form-item
          label="入库仓库"
          prop="warehouseId"
        >
          <WmWarehouseSelect v-model="formData.warehouseId" />
        </el-form-item>
        <el-form-item
          v-if="formData.warehouseId"
          label="库区"
          prop="locationId"
        >
          <WmWarehouseLocationSelect
            v-model="formData.locationId"
            :warehouse-id="formData.warehouseId"
          />
        </el-form-item>
        <el-form-item
          v-if="formData.locationId"
          label="库位"
          prop="areaId"
        >
          <WmWarehouseAreaSelect
            v-model="formData.areaId"
            :location-id="formData.locationId"
          />
        </el-form-item>
        <el-form-item
          label="数量"
          prop="quantity"
        >
          <el-input-number
            v-model="formData.quantity"
            :precision="2"
            :min="0"
            controls-position="right"
            class="wm-w-full"
          />
        </el-form-item>
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
import { WmOutsourceReceiptDetailApi } from '@/api/mes/wm/outsourcereceipt/detail'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
export default {
  name: 'OutsourceReceiptDetailForm',
  components: { MdItemSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect },
  props: { 'receiptId': { type: Number, required: true }},
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
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formLoading = ref(false)
    const formType = ref('')
    const currentLineId = ref()
    const formRef = ref()
    const formData = ref({
      id: undefined,
      lineId: undefined,
      receiptId: undefined,
      itemId: undefined,
      batchCode: undefined,
      quantity: undefined,
      warehouseId: undefined,
      locationId: undefined,
      areaId: undefined,
      remark: undefined
    })
    const formRules = reactive({
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      batchCode: [{ required: true, message: '批次号不能为空', trigger: 'blur' }],
      warehouseId: [{ required: true, message: '入库仓库不能为空', trigger: 'change' }],
      locationId: [{ required: true, message: '库区不能为空', trigger: 'change' }],
      areaId: [{ required: true, message: '库位不能为空', trigger: 'change' }],
      quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }]
    })
    /** 打开弹窗 */
    const open = async(type, lineId, itemId, detailId) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加收货明细' : '编辑收货明细'
      formType.value = type
      currentLineId.value = lineId
      resetForm()
      if (detailId) {
        formLoading.value = true
        try {
          formData.value = (await WmOutsourceReceiptDetailApi.getOutsourceReceiptDetail(detailId)).data
        } finally {
          formLoading.value = false
        }
      } else if (itemId) {
        formData.value.itemId = itemId
      }
    }
    /** 提交表单 */
    const submitForm = async() => {
      await formRef.value.validate()
      formLoading.value = true
      try {
        const data = {
          ...formData.value,
          receiptId: props.receiptId,
          lineId: currentLineId.value
        }
        if (formType.value === 'create') {
          (await WmOutsourceReceiptDetailApi.createOutsourceReceiptDetail(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmOutsourceReceiptDetailApi.updateOutsourceReceiptDetail(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
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
        receiptId: undefined,
        itemId: undefined,
        batchCode: undefined,
        quantity: undefined,
        warehouseId: undefined,
        locationId: undefined,
        areaId: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { ...toRefs(props), MdItemSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, currentLineId, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, message, open, resetForm, submitForm, t }
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
