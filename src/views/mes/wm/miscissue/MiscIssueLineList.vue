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
          label="出库数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          label="批次编码"
          align="center"
          prop="batchCode"
          min-width="120"
        />
        <el-table-column
          label="仓库"
          align="center"
          prop="warehouseName"
          min-width="120"
        />
        <el-table-column
          label="库区"
          align="center"
          prop="locationName"
          min-width="120"
        />
        <el-table-column
          label="库位"
          align="center"
          prop="areaName"
          min-width="120"
        />
        <el-table-column
          v-if="isUpdate"
          label="操作"
          align="center"
          width="120"
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
              label="库存物资"
              prop="materialStockId"
            >
              <WmMaterialStockSelect
                v-model="formData.materialStockId"
                :item-id="formData.itemId"
                @change="handleStockChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="出库数量"
              prop="quantity"
            >
              <el-input-number
                v-model="formData.quantity"
                :precision="2"
                :min="0.01"
                :max="formData.quantityMax"
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
                placeholder="批次号"
                disabled
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
import { ref, reactive, computed, onMounted, toRefs, getCurrentInstance } from 'vue'
import { WmMiscIssueLineApi } from '@/api/mes/wm/miscissue/line'
import WmMaterialStockSelect from '@/views/mes/wm/materialstock/components/WmMaterialStockSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
export default {
  name: 'MiscIssueLineList',
  components: { WmMaterialStockSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect },
  props: { 'issueId': { type: Number, required: true }, 'formType': { type: String, required: true }},
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
    const isUpdate = computed(() => ['create', 'update'].includes(props.formType)) // 是否为编辑模式
    // ==================== 列表 ====================
    const loading = ref(false) // 列表的加载中
    const list = ref([]) // 行列表
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      issueId: undefined
    })
    /** 查询行列表 */
    const getList = async() => {
      loading.value = true
      try {
        queryParams.issueId = props.issueId
        const data = (await WmMiscIssueLineApi.getMiscIssueLinePage(queryParams)).data
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
        (await WmMiscIssueLineApi.deleteMiscIssueLine(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    // ==================== 添加/编辑表单 ====================
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formLoading = ref(false) // 表单的加载中
    const lineFormType = ref('') // 行表单的类型
    const formData = ref({
      id: undefined,
      issueId: undefined,
      materialStockId: undefined,
      itemId: undefined,
      quantity: undefined,
      batchCode: undefined,
      warehouseId: undefined,
      locationId: undefined,
      areaId: undefined,
      remark: undefined,
      quantityMax: undefined
    })
    const formRules = reactive({
      materialStockId: [{ required: true, message: '请选择库存物资', trigger: 'change' }],
      quantity: [
        { required: true, message: '出库数量不能为空', trigger: 'blur' },
        { type: 'number', min: 0.01, message: '出库数量必须大于等于0.01', trigger: 'blur' }
      ]
    })
    const formRef = ref() // 表单 Ref
    /** 库存物资选择变化时，自动回填物料、批次号、仓库位置 */
    const handleStockChange = (stock) => {
      if (stock) {
        formData.value.itemId = stock.itemId
        formData.value.batchCode = stock.batchCode
        formData.value.warehouseId = stock.warehouseId
        formData.value.locationId = stock.locationId
        formData.value.areaId = stock.areaId
        formData.value.quantityMax = stock.quantity
      } else {
        formData.value.itemId = undefined
        formData.value.batchCode = undefined
        formData.value.warehouseId = undefined
        formData.value.locationId = undefined
        formData.value.areaId = undefined
        formData.value.quantityMax = undefined
      }
    }
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加物料出库单行' : '修改物料出库单行'
      lineFormType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmMiscIssueLineApi.getMiscIssueLine(id)).data
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
        const data = { ...formData.value, issueId: props.issueId }
        if (lineFormType.value === 'create') {
          (await WmMiscIssueLineApi.createMiscIssueLine(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmMiscIssueLineApi.updateMiscIssueLine(data)).data
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
        issueId: undefined,
        materialStockId: undefined,
        itemId: undefined,
        quantity: undefined,
        batchCode: undefined,
        warehouseId: undefined,
        locationId: undefined,
        areaId: undefined,
        remark: undefined,
        quantityMax: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    /** 初始化 */
    onMounted(async() => {
      await getList()
    })
    return { ...toRefs(props), WmMaterialStockSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleDelete, handleStockChange, isUpdate, lineFormType, list, loading, message, openForm, queryParams, resetForm, submitForm, t, total }
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
