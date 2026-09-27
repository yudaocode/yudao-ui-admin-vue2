<template>
  <div class="wm-migrated">
    <div class="overflow-hidden">
      <el-button
        type="primary"
        plain
        :disabled="disabled"
        class="mb-10px"
        @click="openForm('create')"
      >
        <i class="el-icon-plus mr-5px" /> 添加条件
      </el-button>
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        border
      >
        <el-table-column
          label="条件类型"
          align="center"
          min-width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_STOCK_TAKING_PLAN_PARAM_TYPE"
              :value="scope.row.type"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="条件值编码"
          align="center"
          prop="valueCode"
          min-width="140"
        />
        <el-table-column
          label="条件值名称"
          align="center"
          prop="valueName"
          min-width="160"
        />
        <el-table-column
          v-if="!disabled"
          label="操作"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              type="text"
              @click="handleDelete(scope.row)"
            >删除</el-button>
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

    <!-- 添加/编辑条件弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="900px"
      append-to-body
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="条件类型"
              prop="type"
            >
              <el-select
                v-model="formData.type"
                placeholder="请选择条件类型"
                class="wm-w-full"
                @change="handleTypeChange"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_STOCK_TAKING_PLAN_PARAM_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.type"
            :span="24"
          >
            <el-form-item
              label="条件值"
              prop="valueId"
            >
              <template v-if="formData.type === MesWmStockTakingParamTypeEnum.WAREHOUSE">
                <WmWarehouseSelect
                  v-model="formData.valueId"
                  @change="handleSelectorChange"
                />
              </template>
              <template v-else-if="formData.type === MesWmStockTakingParamTypeEnum.LOCATION">
                <div class="space-y-2">
                  <WmWarehouseSelect
                    v-model="locationWarehouseId"
                    class="wm-w-full"
                    placeholder="请选择仓库"
                    @change="handleLocationWarehouseChange"
                  />
                  <WmWarehouseLocationSelect
                    v-if="locationWarehouseId"
                    v-model="formData.valueId"
                    :warehouse-id="locationWarehouseId"
                    class="wm-w-full"
                    placeholder="请选择库区"
                    @change="handleSelectorChange"
                  />
                </div>
              </template>
              <template v-else-if="formData.type === MesWmStockTakingParamTypeEnum.AREA">
                <div class="space-y-2">
                  <WmWarehouseSelect
                    v-model="areaWarehouseId"
                    class="wm-w-full"
                    placeholder="请选择仓库"
                    @change="handleAreaWarehouseChange"
                  />
                  <WmWarehouseLocationSelect
                    v-if="areaWarehouseId"
                    v-model="areaLocationId"
                    :warehouse-id="areaWarehouseId"
                    class="wm-w-full"
                    placeholder="请选择库区"
                    @change="handleAreaLocationChange"
                  />
                  <WmWarehouseAreaSelect
                    v-if="areaLocationId"
                    v-model="formData.valueId"
                    :warehouse-id="areaWarehouseId"
                    class="wm-w-full"
                    placeholder="请选择库位"
                    @change="handleSelectorChange"
                  />
                </div>
              </template>
              <template v-else-if="formData.type === MesWmStockTakingParamTypeEnum.ITEM">
                <MdItemSelect
                  v-model="formData.valueId"
                  @change="handleSelectorChange"
                />
              </template>
              <template v-else-if="formData.type === MesWmStockTakingParamTypeEnum.BATCH">
                <!-- DONE 后续接入批次选择器和质量状态选择器 -->
                <WmBatchSelect
                  v-model="formData.valueId"
                  @change="handleBatchChange"
                />
              </template>
              <template v-else-if="formData.type === MesWmStockTakingParamTypeEnum.QUALITY_STATUS">
                <el-select
                  v-model="qualityStatusValue"
                  placeholder="请选择质量状态"
                  class="wm-w-full"
                >
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_QUALITY_STATUS)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
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
  </div>
</template>

<script>
import { ref, reactive, computed, watch, toRefs, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { StockTakingPlanParamApi } from '@/api/mes/wm/stocktaking/plan/param'
import { MesWmStockTakingParamTypeEnum } from '@/views/mes/utils/constants'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmBatchSelect from '@/views/mes/wm/batch/components/WmBatchSelect.vue'
import { WmWarehouseLocationApi } from '@/api/mes/wm/warehouse/location'
import { WmWarehouseAreaApi } from '@/api/mes/wm/warehouse/area'
export default {
  name: 'StockTakingPlanParamList',
  components: { WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect, MdItemSelect, WmBatchSelect },
  props: { 'planId': { type: Number, required: true }, 'disabled': { type: Boolean }},
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
    // ==================== 列表 ====================
    const loading = ref(false)
    const list = ref([])
    const total = ref(0)
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      planId: undefined
    })
    /** 查询条件列表 */
    const getList = async() => {
      loading.value = true
      try {
        queryParams.planId = props.planId
        const data = (await StockTakingPlanParamApi.getStockTakingPlanParamPage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(row) => {
      try {
        await message.delConfirm();
        (await StockTakingPlanParamApi.deleteStockTakingPlanParam(row.id)).data
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
    const formType = ref('')
    const formData = ref({
      id: undefined,
      planId: undefined,
      type: undefined,
      valueId: undefined,
      valueCode: '',
      valueName: '',
      remark: ''
    })
    const qualityStatusValue = computed({
      get: () => (formData.value.valueCode ? Number(formData.value.valueCode) : undefined),
      set: (val) => handleQualityStatusChange(val)
    })
    const formRules = reactive({
      type: [{ required: true, message: '请选择条件类型', trigger: 'change' }],
      valueId: [
        {
          validator: (_rule, _value) => {
            // 质量状态类型不使用 valueId，校验 valueCode
            if (formData.value.type === MesWmStockTakingParamTypeEnum.QUALITY_STATUS) {
              return formData.value.valueCode
                ? Promise.resolve()
                : Promise.reject(new Error('请选择质量状态'))
            }
            return formData.value.valueId ? Promise.resolve() : Promise.reject(new Error('条件值不能为空'))
          },
          trigger: 'change'
        }
      ]
    })
    const formRef = ref()
    const locationWarehouseId = ref() // 库区选择器的临时数据：选择仓库后，传给库区选择器
    const areaWarehouseId = ref() // 库位选择器的临时数据：选择仓库后，传给库位选择器
    const areaLocationId = ref() // 库位选择器的临时数据：选择库区后，传给库位选择器
    const isLoadingData = ref(false) // 标记是否正在加载数据，避免 watch 清空字段
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = t('action.' + type)
      formType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        isLoadingData.value = true
        try {
          formData.value = (await StockTakingPlanParamApi.getStockTakingPlanParam(id)).data
          // 编辑时，需要回填级联选择器的中间层级数据
          await loadCascadeData()
        } finally {
          formLoading.value = false
          isLoadingData.value = false
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
          planId: props.planId,
          valueId: formData.value.valueId != null ? Number(formData.value.valueId) : undefined
        }
        if (formType.value === 'create') {
          (await StockTakingPlanParamApi.createStockTakingPlanParam(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await StockTakingPlanParamApi.updateStockTakingPlanParam(data)).data
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
        planId: props.planId,
        type: undefined,
        valueId: undefined,
        valueCode: '',
        valueName: '',
        remark: ''
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    /** 条件类型变化 */
    const handleTypeChange = () => {
      // 加载数据时不清空字段
      if (isLoadingData.value) {
        return
      }
      formData.value.valueId = undefined
      formData.value.valueCode = ''
      formData.value.valueName = ''
      // 清空仓库层级的临时数据
      locationWarehouseId.value = undefined
      areaWarehouseId.value = undefined
      areaLocationId.value = undefined
    }
    /** 选择器变化 */
    const handleSelectorChange = (item) => {
      formData.value.valueId = item === null || item === void 0 ? void 0 : item.id
      formData.value.valueCode = (item === null || item === void 0 ? void 0 : item.code) || ''
      formData.value.valueName = (item === null || item === void 0 ? void 0 : item.name) || (item === null || item === void 0 ? void 0 : item.nickname) || ''
    }
    /** 批次选择器变化 */
    const handleBatchChange = (batch) => {
      formData.value.valueId = batch === null || batch === void 0 ? void 0 : batch.id
      formData.value.valueCode = (batch === null || batch === void 0 ? void 0 : batch.code) || ''
      formData.value.valueName = (batch === null || batch === void 0 ? void 0 : batch.code) || ''
    }
    /** 质量状态选择器变化 */
    const handleQualityStatusChange = (val) => {
      const dictOptions = getIntDictOptions(DICT_TYPE.MES_WM_QUALITY_STATUS)
      const selected = dictOptions.find((d) => d.value === val)
      formData.value.valueId = undefined // 质量状态无实体 ID
      formData.value.valueCode = val == null ? '' : String(val)
      formData.value.valueName = (selected === null || selected === void 0 ? void 0 : selected.label) || ''
    }
    /** 库区仓库选择回调：清空库区 */
    const handleLocationWarehouseChange = () => {
      formData.value.valueId = undefined
      formData.value.valueCode = ''
      formData.value.valueName = ''
    }
    /** 库位仓库选择回调：清空库区和库位 */
    const handleAreaWarehouseChange = () => {
      areaLocationId.value = undefined
      formData.value.valueId = undefined
      formData.value.valueCode = ''
      formData.value.valueName = ''
    }
    /** 库位库区选择回调：清空库位 */
    const handleAreaLocationChange = () => {
      formData.value.valueId = undefined
      formData.value.valueCode = ''
      formData.value.valueName = ''
    }
    /** 加载级联选择器的数据（编辑时回填上级数据） */
    const loadCascadeData = async() => {
      if (!formData.value.type || !formData.value.valueId) {
        return
      }
      try {
        const vid = formData.value.valueId
        // 库区类型：需要查询库区信息，获取所属仓库ID
        if (formData.value.type === MesWmStockTakingParamTypeEnum.LOCATION) {
          const location = (await WmWarehouseLocationApi.getWarehouseLocation(vid)).data
          if (location === null || location === void 0 ? void 0 : location.warehouseId) {
            locationWarehouseId.value = location.warehouseId
          }
        } else if (formData.value.type === MesWmStockTakingParamTypeEnum.AREA) {
          // 库位类型：需要查询库位信息，获取所属仓库ID和库区ID
          const area = (await WmWarehouseAreaApi.getWarehouseArea(vid)).data
          if (area === null || area === void 0 ? void 0 : area.warehouseId) {
            areaWarehouseId.value = area.warehouseId
          }
          if (area === null || area === void 0 ? void 0 : area.locationId) {
            areaLocationId.value = area.locationId
          }
        }
      } catch (error) {
        console.error('加载级联数据失败:', error)
      }
    }
    /** 监听 planId 变化 */
    watch(() => props.planId, async() => {
      queryParams.pageNo = 1
      await getList()
    }, { immediate: true })
    return { ...toRefs(props), DICT_TYPE, MdItemSelect, MesWmStockTakingParamTypeEnum, WmBatchSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, areaLocationId, areaWarehouseId, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, getIntDictOptions, getList, handleAreaLocationChange, handleAreaWarehouseChange, handleBatchChange, handleDelete, handleLocationWarehouseChange, handleQualityStatusChange, handleSelectorChange, handleTypeChange, isLoadingData, list, loadCascadeData, loading, locationWarehouseId, message, openForm, qualityStatusValue, queryParams, resetForm, submitForm, t, total }
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
