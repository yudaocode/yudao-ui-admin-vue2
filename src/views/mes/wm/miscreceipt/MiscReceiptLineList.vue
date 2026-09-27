<template>
  <div class="wm-migrated">
    <div>
      <el-button
        v-if="isEditable"
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
      >
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
          label="仓库"
          align="center"
          prop="warehouseName"
          min-width="100"
        />
        <el-table-column
          label="库区"
          align="center"
          prop="locationName"
          min-width="100"
        />
        <el-table-column
          label="库位"
          align="center"
          prop="areaName"
          min-width="100"
        />
        <el-table-column
          v-if="isEditable"
          label="操作"
          align="center"
          width="160"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              @click="handleDelete(scope.row.id)"
            > 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
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
              label="物料"
              prop="itemId"
            >
              <MdItemSelect
                v-model="formData.itemId"
                placeholder="请选择物料"
                class="wm-w-full"
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
                :min="0.01"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="批次号"
              prop="batchCode"
            >
              <el-input
                v-model="formData.batchCode"
                placeholder="请输入批次号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="仓库"
              prop="warehouseId"
            >
              <WmWarehouseSelect
                v-model="formData.warehouseId"
                placeholder="请选择仓库"
                class="wm-w-full"
                @change="handleWarehouseChange"
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
                placeholder="请选择库区"
                class="wm-w-full"
                @change="handleLocationChange"
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
                placeholder="请选择库位"
                class="wm-w-full"
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
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, toRefs, getCurrentInstance } from 'vue'
import { WmMiscReceiptLineApi } from '@/api/mes/wm/miscreceipt/line/index'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
export default {
  name: 'MiscReceiptLineList',
  components: { MdItemSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect },
  props: { 'receiptId': { type: Number, required: true }, 'formType': { type: String, required: true }},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    }
    const isEditable = computed(() => ['create', 'update'].includes(props.formType))
    // ==================== 列表 ====================
    const loading = ref(false)
    const list = ref([])
    /** 查询行列表 */
    const getList = async() => {
      loading.value = true
      try {
        list.value = (await WmMiscReceiptLineApi.getMiscReceiptLineListByReceiptId(props.receiptId)).data
      } finally {
        loading.value = false
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await WmMiscReceiptLineApi.deleteMiscReceiptLine(id)).data
        message.success('删除成功')
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    // ==================== 添加/编辑表单 ====================
    const dialogVisible = ref(false)
    const formLoading = ref(false)
    const lineFormType = ref('create')
    const dialogTitle = computed(() => {
      return lineFormType.value === 'create' ? '添加物料' : '编辑物料'
    })
    const formData = ref({
      id: undefined,
      receiptId: props.receiptId,
      itemId: undefined,
      quantity: undefined,
      batchCode: undefined,
      warehouseId: undefined,
      locationId: undefined,
      areaId: undefined,
      remark: undefined
    })
    const formRules = reactive({
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      quantity: [
        { required: true, message: '入库数量不能为空', trigger: 'blur' },
        { type: 'number', min: 0.01, message: '入库数量必须大于 0', trigger: 'blur' }
      ],
      warehouseId: [{ required: true, message: '仓库不能为空', trigger: 'change' }],
      locationId: [{ required: true, message: '库区不能为空', trigger: 'change' }],
      areaId: [{ required: true, message: '库位不能为空', trigger: 'change' }]
    })
    const formRef = ref()
    /** 仓库变化时，清空库区和库位 */
    const handleWarehouseChange = () => {
      formData.value.locationId = undefined
      formData.value.areaId = undefined
    }
    /** 库区变化时，清空库位 */
    const handleLocationChange = () => {
      formData.value.areaId = undefined
    }
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      lineFormType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmMiscReceiptLineApi.getMiscReceiptLine(id)).data
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
        const data = formData.value
        if (lineFormType.value === 'create') {
          (await WmMiscReceiptLineApi.createMiscReceiptLine(data)).data
          message.success('新增成功')
        } else {
          (await WmMiscReceiptLineApi.updateMiscReceiptLine(data)).data
          message.success('修改成功')
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
        receiptId: props.receiptId,
        itemId: undefined,
        quantity: undefined,
        batchCode: undefined,
        warehouseId: undefined,
        locationId: undefined,
        areaId: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    /** 初始化 */
    onMounted(() => {
      getList()
    })
    watch(() => props.receiptId, () => {
      if (props.receiptId) {
        getList()
      }
    })
    return { ...toRefs(props), MdItemSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleDelete, handleLocationChange, handleWarehouseChange, isEditable, lineFormType, list, loading, message, openForm, resetForm, submitForm }
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
