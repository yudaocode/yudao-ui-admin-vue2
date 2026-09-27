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
        label-width="100px"
      >
        <el-form-item
          label="业务类型"
          prop="bizType"
        >
          <el-select
            v-model="formData.bizType"
            placeholder="请选择业务类型"
            class="wm-w-full"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_BARCODE_BIZ_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="formData.bizType === BarcodeBizTypeEnum.WAREHOUSE"
          label="仓库"
          prop="bizId"
        >
          <WmWarehouseSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.LOCATION"
          label="库区"
          prop="bizId"
        >
          <div class="space-y-2">
            <WmWarehouseSelect
              v-model="locationWarehouseId"
              class="wm-w-full"
              placeholder="请选择仓库"
              @change="handleLocationWarehouseChange"
            />
            <WmWarehouseLocationSelect
              v-model="formData.bizId"
              :warehouse-id="locationWarehouseId"
              class="wm-w-full"
              placeholder="请选择库区"
              @change="handleBizSelect"
            />
          </div>
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.AREA"
          label="库位"
          prop="bizId"
        >
          <div class="space-y-2">
            <WmWarehouseSelect
              v-model="areaWarehouseId"
              class="wm-w-full"
              placeholder="请选择仓库"
              @change="handleAreaWarehouseChange"
            />
            <WmWarehouseLocationSelect
              v-model="areaLocationId"
              :warehouse-id="areaWarehouseId"
              class="wm-w-full"
              placeholder="请选择库区"
              @change="handleAreaLocationChange"
            />
            <WmWarehouseAreaSelect
              v-model="formData.bizId"
              :location-id="areaLocationId"
              class="wm-w-full"
              placeholder="请选择库位"
              @change="handleBizSelect"
            />
          </div>
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.WORKORDER"
          label="工单"
          prop="bizId"
        >
          <ProWorkOrderSelect
            v-model="formData.bizId"
            :status="MesProWorkOrderStatusEnum.CONFIRMED"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.MACHINERY"
          label="设备"
          prop="bizId"
        >
          <DvMachinerySelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.ITEM"
          label="产品物料"
          prop="bizId"
          class="wm-w-full"
        >
          <MdItemSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.VENDOR"
          label="供应商"
          prop="bizId"
        >
          <MdVendorSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.WORKSTATION"
          label="工作站"
          prop="bizId"
        >
          <MdWorkstationSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.WORKSHOP"
          label="车间"
          prop="bizId"
        >
          <MdWorkshopSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.USER"
          label="人员"
          prop="bizId"
        >
          <UserSelectV2
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.CLIENT"
          label="客户"
          prop="bizId"
        >
          <MdClientSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.TOOL"
          label="工具"
          prop="bizId"
        >
          <TmToolSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.PACKAGE"
          label="装箱单"
          prop="bizId"
        >
          <WmPackageSelect
            v-model="formData.bizId"
            :childable-only="true"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.STOCK"
          label="库存"
          prop="bizId"
        >
          <WmMaterialStockSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.BATCH"
          label="批次"
          prop="bizId"
        >
          <WmBatchSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <el-form-item
          v-else-if="formData.bizType === BarcodeBizTypeEnum.PROCARD"
          label="流转卡"
          prop="bizId"
        >
          <ProCardSelect
            v-model="formData.bizId"
            class="wm-w-full"
            @change="handleBizSelect"
          />
        </el-form-item>
        <!-- TODO 流转单（TRANSORDER）后端模块尚未实现，待后续补充 -->
        <el-form-item
          v-else-if="formData.bizType"
          label="暂未接入"
          prop="bizId"
        >
          <el-input-number
            v-model="formData.bizId"
            :min="1"
            class="wm-w-240"
            placeholder="请输入业务编号"
          />
        </el-form-item>
        <el-form-item
          label="业务编码"
          prop="bizCode"
        >
          <el-input
            v-model="formData.bizCode"
            placeholder="请输入业务编码"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="业务名称"
          prop="bizName"
        >
          <el-input
            v-model="formData.bizName"
            placeholder="请输入业务名称"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="条码内容"
          prop="content"
        >
          <el-input
            v-model="formData.content"
            placeholder="请输入条码内容或自动生成"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="formData.status">
            <el-radio
              v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
              :key="dict.value"
              :label="dict.value"
            >
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
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
import { ref, reactive, watch, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { WmBarcodeApi } from '@/api/mes/wm/barcode'
import { BarcodeBizTypeEnum, MesProWorkOrderStatusEnum } from '@/views/mes/utils/constants'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import DvMachinerySelect from '@/views/mes/dv/machinery/components/DvMachinerySelect.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'
import MdWorkshopSelect from '@/views/mes/md/workstation/components/MdWorkshopSelect.vue'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import TmToolSelect from '@/views/mes/tm/tool/components/TmToolSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import WmPackageSelect from '@/views/mes/wm/packages/components/WmPackageSelect.vue'
import WmMaterialStockSelect from '@/views/mes/wm/materialstock/components/WmMaterialStockSelect.vue'
import WmBatchSelect from '@/views/mes/wm/batch/components/WmBatchSelect.vue'
import ProCardSelect from '@/views/mes/pro/card/components/ProCardSelect.vue'
import { WmWarehouseLocationApi } from '@/api/mes/wm/warehouse/location'
import { WmWarehouseAreaApi } from '@/api/mes/wm/warehouse/area'
export default {
  name: 'BarcodeForm',
  components: { WmWarehouseSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, ProWorkOrderSelect, DvMachinerySelect, MdItemSelect, MdVendorSelect, MdWorkstationSelect, MdWorkshopSelect, MdClientSelect, TmToolSelect, UserSelectV2, WmPackageSelect, WmMaterialStockSelect, WmBatchSelect, ProCardSelect },
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
    const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
    const formType = ref('') // 表单的类型：create - 新增；update - 修改
    const formData = ref({
      id: undefined,
      bizType: undefined,
      bizId: undefined,
      bizCode: undefined,
      bizName: undefined,
      content: undefined,
      status: CommonStatusEnum.ENABLE,
      remark: ''
    })
    const formRules = reactive({
      bizType: [{ required: true, message: '业务类型不能为空', trigger: 'change' }],
      bizId: [{ required: true, message: '业务编号不能为空', trigger: 'blur' }],
      bizCode: [{ required: true, message: '业务编码不能为空', trigger: 'blur' }],
      bizName: [{ required: true, message: '业务名称不能为空', trigger: 'blur' }],
      content: [{ required: true, message: '条码内容不能为空', trigger: 'blur' }]
    })
    const formRef = ref()
    const locationWarehouseId = ref() // 库区选择器的临时数据：选择仓库后，传给库区选择器
    const areaWarehouseId = ref() // 库位选择器的临时数据：选择仓库后，传给库位选择器
    const areaLocationId = ref() // 库位选择器的临时数据：选择库区后，传给库位选择器
    const isLoadingData = ref(false) // 标记是否正在加载数据，避免 watch 清空字段
    /** 业务 Select 选中回调：自动填充 bizId、bizCode、bizName */
    const handleBizSelect = async(item) => {
      if (!item) {
        formData.value.bizId = undefined
        formData.value.bizCode = undefined
        formData.value.bizName = undefined
        formData.value.content = undefined
        return
      }
      formData.value.bizId = item.id
      // 根据业务类型映射字段
      switch (formData.value.bizType) {
        case BarcodeBizTypeEnum.STOCK:
          formData.value.bizCode = item.itemCode
          formData.value.bizName = item.itemName
          break
        case BarcodeBizTypeEnum.PACKAGE:
          formData.value.bizCode = item.code
          formData.value.bizName = item.clientName || item.code
          break
        case BarcodeBizTypeEnum.BATCH:
          formData.value.bizCode = item.code
          formData.value.bizName = item.itemName || item.code
          break
        case BarcodeBizTypeEnum.PROCARD:
          formData.value.bizCode = item.code
          formData.value.bizName = item.workOrderName || item.code
          break
        default:
          formData.value.bizCode = item.code || item.username
          formData.value.bizName = item.name || item.nickname
      }
      // 自动生成条码内容
      if (formData.value.bizType && formData.value.bizCode) {
        try {
          formData.value.content = (await WmBarcodeApi.generateBarcodeContent(formData.value.bizType, formData.value.bizCode)).data
        } catch (error) {
          console.error('生成条码内容失败:', error)
          formData.value.content = undefined
        }
      }
    }
    /** 库区仓库选择回调：清空库区 */
    const handleLocationWarehouseChange = () => {
      formData.value.bizId = undefined
      formData.value.bizCode = undefined
      formData.value.bizName = undefined
      formData.value.content = undefined
    }
    /** 库位仓库选择回调：清空库区和库位 */
    const handleAreaWarehouseChange = () => {
      areaLocationId.value = undefined
      formData.value.bizId = undefined
      formData.value.bizCode = undefined
      formData.value.bizName = undefined
      formData.value.content = undefined
    }
    /** 库位库区选择回调：清空库位 */
    const handleAreaLocationChange = () => {
      formData.value.bizId = undefined
      formData.value.bizCode = undefined
      formData.value.bizName = undefined
      formData.value.content = undefined
    }
    /** 加载级联选择器的数据（编辑时回填上级数据） */
    const loadCascadeData = async() => {
      if (!formData.value.bizType || !formData.value.bizId) {
        return
      }
      try {
        // 库区类型：需要查询库区信息，获取所属仓库ID
        if (formData.value.bizType === BarcodeBizTypeEnum.LOCATION) {
          const location = (await WmWarehouseLocationApi.getWarehouseLocation(formData.value.bizId)).data
          if (location === null || location === void 0 ? void 0 : location.warehouseId) {
            locationWarehouseId.value = location.warehouseId
          }
        } else if (formData.value.bizType === BarcodeBizTypeEnum.AREA) {
          // 库位类型：需要查询库位信息，获取所属仓库ID和库区ID
          const area = (await WmWarehouseAreaApi.getWarehouseArea(formData.value.bizId)).data
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
    /** bizType 切换时，清空业务字段 */
    watch(() => formData.value.bizType, () => {
      // 加载数据时不清空字段
      if (isLoadingData.value) {
        return
      }
      formData.value.bizId = undefined
      formData.value.bizCode = undefined
      formData.value.bizName = undefined
      formData.value.content = undefined
      // 清空仓库层级的临时数据
      locationWarehouseId.value = undefined
      areaWarehouseId.value = undefined
      areaLocationId.value = undefined
    })
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '新增条码' : '修改条码'
      formType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        isLoadingData.value = true
        try {
          formData.value = (await WmBarcodeApi.getBarcode(id)).data
          // 编辑时，需要回填级联选择器的中间层级数据
          await loadCascadeData()
        } finally {
          formLoading.value = false
          isLoadingData.value = false
        }
      }
    }
    const submitForm = async() => {
      await formRef.value.validate()
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          (await WmBarcodeApi.createBarcode(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmBarcodeApi.updateBarcode(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      formData.value = {
        id: undefined,
        bizType: undefined,
        bizId: undefined,
        bizCode: undefined,
        bizName: undefined,
        content: undefined,
        status: CommonStatusEnum.ENABLE,
        remark: ''
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { BarcodeBizTypeEnum, DICT_TYPE, DvMachinerySelect, MdClientSelect, MdItemSelect, MdVendorSelect, MdWorkshopSelect, MdWorkstationSelect, MesProWorkOrderStatusEnum, ProCardSelect, ProWorkOrderSelect, TmToolSelect, UserSelectV2, WmBatchSelect, WmMaterialStockSelect, WmPackageSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, areaLocationId, areaWarehouseId, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, getIntDictOptions, handleAreaLocationChange, handleAreaWarehouseChange, handleBizSelect, handleLocationWarehouseChange, isLoadingData, loadCascadeData, locationWarehouseId, message, open, resetForm, submitForm, t }
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
