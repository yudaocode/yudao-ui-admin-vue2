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
          label="移入仓库"
          prop="toWarehouseId"
        >
          <WmWarehouseSelect v-model="formData.toWarehouseId" />
        </el-form-item>
        <el-form-item
          v-if="formData.toWarehouseId"
          label="移入库区"
          prop="toLocationId"
        >
          <WmWarehouseLocationSelect
            v-model="formData.toLocationId"
            :warehouse-id="formData.toWarehouseId"
          />
        </el-form-item>
        <el-form-item
          v-if="formData.toLocationId"
          label="移入库位"
          prop="toAreaId"
        >
          <WmWarehouseAreaSelect
            v-model="formData.toAreaId"
            :location-id="formData.toLocationId"
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
import { WmTransferDetailApi } from '@/api/mes/wm/transfer/detail'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
export default {
  name: 'TransferDetailForm',
  components: { MdItemSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect },
  props: { 'transferId': { type: Number, required: true }},
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
    const formRef = ref() // 表单 Ref
    const formData = ref({
      id: undefined,
      lineId: undefined,
      transferId: undefined,
      itemId: undefined,
      quantity: undefined,
      batchId: undefined,
      toWarehouseId: undefined,
      toLocationId: undefined,
      toAreaId: undefined,
      remark: undefined
    })
    const formRules = reactive({
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      toWarehouseId: [{ required: true, message: '移入仓库不能为空', trigger: 'change' }],
      toLocationId: [{ required: true, message: '移入库区不能为空', trigger: 'change' }],
      toAreaId: [{ required: true, message: '移入库位不能为空', trigger: 'change' }],
      quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }]
    })
    /** 打开弹窗 */
    const open = async(type, lineId, itemId, detailId) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加调拨明细' : '编辑调拨明细'
      formType.value = type
      currentLineId.value = lineId
      resetForm()
      // 修改时，设置数据
      if (detailId) {
        formLoading.value = true
        try {
          formData.value = (await WmTransferDetailApi.getTransferDetail(detailId)).data
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
          transferId: props.transferId,
          lineId: currentLineId.value
        }
        if (formType.value === 'create') {
          (await WmTransferDetailApi.createTransferDetail(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmTransferDetailApi.updateTransferDetail(data)).data
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
        transferId: undefined,
        itemId: undefined,
        quantity: undefined,
        batchId: undefined,
        toWarehouseId: undefined,
        toLocationId: undefined,
        toAreaId: undefined,
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
