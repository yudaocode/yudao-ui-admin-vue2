<template>
  <div class="wm-migrated">
    <div class="overflow-hidden">
      <!-- 新增按钮 -->
      <el-button
        v-if="!isReadOnly"
        v-hasPermi="['mes:wm-stock-taking-task:update']"
        type="primary"
        plain
        class="mb-10px"
        @click="openForm('create')"
      >
        <i class="el-icon-plus mr-5px" /> 新增
      </el-button>
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        border
      >
        <el-table-column
          label="产品物料编码"
          align="center"
          prop="itemCode"
          min-width="140"
        />
        <el-table-column
          label="产品物料名称"
          align="center"
          prop="itemName"
          min-width="160"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="specification"
          min-width="120"
        />
        <el-table-column
          label="单位名称"
          align="center"
          prop="unitMeasureName"
          width="90"
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
          label="数量"
          align="center"
          prop="quantity"
          min-width="120"
        />
        <el-table-column
          label="盘点数量"
          align="center"
          prop="takingQuantity"
          min-width="120"
        />
        <el-table-column
          v-if="!isReadOnly"
          label="操作"
          align="center"
          width="160"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              type="text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 添加/编辑弹窗 -->
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
        <!-- 执行盘点模式：选择盘点清单行（可选，选择后自动带出信息） -->
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="盘点清单"
              prop="lineId"
            >
              <el-select
                v-model="formData.lineId"
                placeholder="请选择盘点清单（可选）"
                class="wm-w-full"
                clearable
                :disabled="dialogFormType !== 'create'"
                @change="handleLineChange"
                @clear="handleLineClear"
              >
                <el-option
                  v-for="line in taskLineList"
                  :key="line.id"
                  :label="`${line.itemCode} - ${line.itemName} (${line.warehouseName}${line.locationName ? ' / ' + line.locationName : ''}${line.areaName ? ' / ' + line.areaName : ''})`"
                  :value="line.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 物料、批次编码、盘点数量 -->
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="物料"
              prop="itemId"
            >
              <MdItemSelect
                v-model="formData.itemId"
                placeholder="请选择物料"
                :disabled="isFieldsDisabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="批次编码"
              prop="batchCode"
            >
              <el-input
                v-model="formData.batchCode"
                placeholder="请输入批次编码"
                :disabled="isFieldsDisabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="盘点数量"
              prop="takingQuantity"
            >
              <el-input-number
                v-model="formData.takingQuantity"
                :precision="2"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 仓库、库区、库位（递归选择） -->
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="仓库"
              prop="warehouseId"
            >
              <WmWarehouseSelect
                v-model="formData.warehouseId"
                placeholder="请选择仓库"
                :disabled="isFieldsDisabled"
                @change="handleWarehouseChange"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.warehouseId"
            :span="8"
          >
            <el-form-item
              label="库区"
              prop="locationId"
            >
              <WmWarehouseLocationSelect
                v-model="formData.locationId"
                :warehouse-id="formData.warehouseId"
                placeholder="请选择库区"
                :disabled="isFieldsDisabled"
                @change="handleLocationChange"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.locationId"
            :span="8"
          >
            <el-form-item
              label="库位"
              prop="areaId"
            >
              <WmWarehouseAreaSelect
                v-model="formData.areaId"
                :location-id="formData.locationId"
                placeholder="请选择库位"
                :disabled="isFieldsDisabled"
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
import { ref, reactive, computed, watch, toRefs, getCurrentInstance } from 'vue'
import { StockTakingResultApi } from '@/api/mes/wm/stocktaking/task/result/index'
import { StockTakingTaskLineApi } from '@/api/mes/wm/stocktaking/task/line/index'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
export default {
  name: 'StockTakingTaskResultList',
  components: { MdItemSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect },
  props: { 'taskId': { type: Number, required: true }, 'formType': { type: String }},
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
    const isReadOnly = computed(() => props.formType === 'detail') // 是否只读
    const isExecute = computed(() => props.formType === 'execute') // 是否执行盘点模式
    // 字段是否禁用：执行盘点模式下，选择了盘点清单后，自动带出的字段禁用
    const isFieldsDisabled = computed(() => {
      return isExecute.value && dialogFormType.value === 'create' && !!formData.value.lineId
    })
    // ==================== 列表 ====================
    const loading = ref(false) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      taskId: undefined
    }) // 查询参数
    /** 查询列表 */
    const getList = async() => {
      if (!props.taskId) {
        return
      }
      loading.value = true
      try {
        queryParams.taskId = props.taskId
        const data = (await StockTakingResultApi.getStockTakingResultPage(queryParams)).data
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
        (await StockTakingResultApi.deleteStockTakingResult(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    // ==================== 添加/编辑表单 ====================
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
    const dialogFormType = ref('') // 表单的类型：create - 新增；update - 修改
    const taskLineList = ref([]) // 盘点清单列表
    const formData = ref({
      id: undefined,
      taskId: undefined,
      lineId: undefined,
      materialStockId: undefined,
      itemId: undefined,
      batchId: undefined,
      batchCode: undefined,
      warehouseId: undefined,
      locationId: undefined,
      areaId: undefined,
      takingQuantity: undefined,
      remark: undefined
    }) // 表单数据
    const formRules = reactive({
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      warehouseId: [{ required: true, message: '仓库不能为空', trigger: 'change' }],
      locationId: [{ required: true, message: '库区不能为空', trigger: 'change' }],
      areaId: [{ required: true, message: '库位不能为空', trigger: 'change' }],
      takingQuantity: [{ required: true, message: '盘点数量不能为空', trigger: 'blur' }]
    }) // 表单校验规则
    const formRef = ref() // 表单 Ref
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = t('action.' + type)
      dialogFormType.value = type
      resetForm()
      // 执行盘点模式下，加载盘点清单列表
      if (isExecute.value) {
        formLoading.value = true
        try {
          taskLineList.value = (await StockTakingTaskLineApi.getStockTakingTaskLineSimpleList(props.taskId)).data
        } finally {
          formLoading.value = false
        }
      }
      // 修改模式下，加载盘点结果数据
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await StockTakingResultApi.getStockTakingResult(id)).data
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
          taskId: props.taskId
        }
        if (dialogFormType.value === 'create') {
          (await StockTakingResultApi.createStockTakingResult(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await StockTakingResultApi.updateStockTakingResult(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        await getList()
      } finally {
        formLoading.value = false
      }
    }
    /** 仓库变化时清空库区和库位 */
    const handleWarehouseChange = () => {
      formData.value.locationId = undefined
      formData.value.areaId = undefined
    }
    /** 库区变化时清空库位 */
    const handleLocationChange = () => {
      formData.value.areaId = undefined
    }
    /** 盘点清单行变化 */
    const handleLineChange = (lineId) => {
      var _a, _b, _c, _d, _e, _f, _g
      const line = taskLineList.value.find((item) => item.id === lineId)
      if (!line) {
        return
      }
      formData.value.materialStockId = (_a = line.materialStockId) !== null && _a !== void 0 ? _a : undefined
      formData.value.itemId = (_b = line.itemId) !== null && _b !== void 0 ? _b : undefined
      formData.value.batchId = (_c = line.batchId) !== null && _c !== void 0 ? _c : undefined
      formData.value.batchCode = (_d = line.batchCode) !== null && _d !== void 0 ? _d : undefined
      formData.value.warehouseId = (_e = line.warehouseId) !== null && _e !== void 0 ? _e : undefined
      formData.value.locationId = (_f = line.locationId) !== null && _f !== void 0 ? _f : undefined
      formData.value.areaId = (_g = line.areaId) !== null && _g !== void 0 ? _g : undefined
    }
    /** 清除盘点清单选择 */
    const handleLineClear = () => {
      formData.value.materialStockId = undefined
      formData.value.itemId = undefined
      formData.value.batchId = undefined
      formData.value.batchCode = undefined
      formData.value.warehouseId = undefined
      formData.value.locationId = undefined
      formData.value.areaId = undefined
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      formData.value = {
        id: undefined,
        taskId: undefined,
        lineId: undefined,
        materialStockId: undefined,
        itemId: undefined,
        batchId: undefined,
        batchCode: undefined,
        warehouseId: undefined,
        locationId: undefined,
        areaId: undefined,
        takingQuantity: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    watch(() => props.taskId, () => {
      queryParams.pageNo = 1
      getList()
    }, { immediate: true })
    return { ...toRefs(props), MdItemSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, dialogFormType, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleDelete, handleLineChange, handleLineClear, handleLocationChange, handleWarehouseChange, isExecute, isFieldsDisabled, isReadOnly, list, loading, message, openForm, queryParams, resetForm, submitForm, t, taskLineList, total }
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
