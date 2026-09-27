<template>
  <div class="wm-migrated">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="980px"
      append-to-body
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="isDetail ? {} : formRules"
        label-width="120px"
        :disabled="isDetail"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="所属仓库">
              <el-select
                v-model="selectedWarehouseId"
                placeholder="请选择仓库"
                class="wm-w-full"
                @change="handleWarehouseChange"
              >
                <el-option
                  v-for="warehouse in warehouseList"
                  :key="warehouse.id"
                  :label="warehouse.name"
                  :value="warehouse.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="所属库区"
              prop="locationId"
            >
              <el-select
                v-model="formData.locationId"
                placeholder="请选择库区"
                class="wm-w-full"
                :disabled="!selectedWarehouseId"
              >
                <el-option
                  v-for="location in locationList"
                  :key="location.id"
                  :label="location.name"
                  :value="location.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="库位编码"
              prop="code"
            >
              <el-input
                v-model="formData.code"
                placeholder="请输入库位编码"
              >
                <template slot="append">
                  <el-button @click="generateCode"> 生成 </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="库位名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入库位名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="面积（㎡）"
              prop="area"
            >
              <el-input-number
                v-model="formData.area"
                :precision="2"
                :min="0"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="最大载重"
              prop="maxLoad"
            >
              <el-input-number
                v-model="formData.maxLoad"
                :precision="2"
                :min="0"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="位置 X"
              prop="positionX"
            >
              <el-input-number
                v-model="formData.positionX"
                :min="0"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="位置 Y"
              prop="positionY"
            >
              <el-input-number
                v-model="formData.positionY"
                :min="0"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="位置 Z"
              prop="positionZ"
            >
              <el-input-number
                v-model="formData.positionZ"
                :min="0"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="状态"
              prop="status"
            >
              <el-select
                v-model="formData.status"
                placeholder="请选择"
                class="wm-w-full"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="是否冻结"
              prop="frozen"
            >
              <el-switch v-model="formData.frozen" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="允许物料混放"
              prop="allowItemMixing"
            >
              <el-switch v-model="formData.allowItemMixing" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="允许批次混放"
              prop="allowBatchMixing"
            >
              <el-switch v-model="formData.allowBatchMixing" />
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
          v-if="isDetail && formData.id"
          type="primary"
          plain
          @click="handleBarcode"
        >
          查看条码
        </el-button>
        <el-button
          v-if="!isDetail"
          type="primary"
          :disabled="formLoading"
          @click="submitForm"
        >
          确 定
        </el-button>
        <el-button @click="dialogVisible = false">{{ isDetail ? '关 闭' : '取 消' }}</el-button>
      </span>
    </el-dialog>
    <!-- 条码详情弹窗（详情模式下展示） -->
    <BarcodeDetail ref="barcodeDetailRef" />
  </div>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { WmWarehouseApi } from '@/api/mes/wm/warehouse'
import { WmWarehouseLocationApi } from '@/api/mes/wm/warehouse/location'
import { WmWarehouseAreaApi } from '@/api/mes/wm/warehouse/area'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { MesAutoCodeRuleCode, BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
export default {
  name: 'AreaForm',
  components: { BarcodeDetail },
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
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增库位',
        update: '编辑库位',
        detail: '库位详情'
      }
      return titles[formType.value] || formType.value
    })
    const formLoading = ref(false) // 表单的加载中
    const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
    const isDetail = computed(() => formType.value === 'detail') // 是否为详情模式
    const selectedWarehouseId = ref(undefined) // 当前选中的仓库 ID
    const warehouseList = ref([]) // 仓库列表
    const locationList = ref([]) // 库区列表
    /** 生成库位编码 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_AREA_CODE)).data
    }
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      locationId: undefined,
      area: undefined,
      maxLoad: undefined,
      positionX: undefined,
      positionY: undefined,
      positionZ: undefined,
      status: CommonStatusEnum.ENABLE,
      frozen: false,
      allowItemMixing: true,
      allowBatchMixing: true,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '库位编码不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '库位名称不能为空', trigger: 'blur' }],
      locationId: [{ required: true, message: '所属库区不能为空', trigger: 'change' }],
      status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
      frozen: [{ required: true, message: '是否冻结不能为空', trigger: 'change' }],
      allowItemMixing: [{ required: true, message: '物料混放开关不能为空', trigger: 'change' }],
      allowBatchMixing: [{ required: true, message: '批次混放开关不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    const barcodeDetailRef = ref() // 条码详情弹窗 Ref
    /** 查看条码 */
    const handleBarcode = () => {
      var _a;
      (_a = barcodeDetailRef.value) === null || _a === void 0 ? void 0 : _a.openByBusiness(formData.value.id, BarcodeBizTypeEnum.AREA, formData.value.code, formData.value.name)
    }
    /** 加载库区列表 */
    const loadLocationList = async(warehouseId) => {
      if (!warehouseId) {
        locationList.value = []
        return
      }
      locationList.value = (await WmWarehouseLocationApi.getWarehouseLocationSimpleList(warehouseId)).data
    }
    /** 仓库改变时，重置库区 */
    const handleWarehouseChange = async(warehouseId) => {
      formData.value.locationId = undefined
      await loadLocationList(warehouseId)
    }
    /** 打开弹窗 */
    const open = async(type, id, defaultLocationId, defaultWarehouseId) => {
      dialogVisible.value = true
      formType.value = type
      resetForm()
      warehouseList.value = (await WmWarehouseApi.getWarehouseSimpleList()).data
      // 修改/详情时，设置数据
      if (id) {
        formLoading.value = true
        try {
          const data = (await WmWarehouseAreaApi.getWarehouseArea(id)).data
          selectedWarehouseId.value = data.warehouseId
          await loadLocationList(selectedWarehouseId.value)
          formData.value = data
        } finally {
          formLoading.value = false
        }
        return
      }
      // 新增时，设置默认仓库和库区（从列表页跳转过来时传入）
      if (defaultWarehouseId) {
        selectedWarehouseId.value = defaultWarehouseId
        await loadLocationList(defaultWarehouseId)
      }
      if (defaultLocationId) {
        if (!selectedWarehouseId.value) {
          const location = (await WmWarehouseLocationApi.getWarehouseLocation(defaultLocationId)).data
          selectedWarehouseId.value = location.warehouseId
          await loadLocationList(selectedWarehouseId.value)
        }
        formData.value.locationId = defaultLocationId
      }
    }
    const submitForm = async() => {
      // 校验表单
      await formRef.value.validate()
      // 提交请求
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          (await WmWarehouseAreaApi.createWarehouseArea(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmWarehouseAreaApi.updateWarehouseArea(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        // 发送操作成功的事件
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      selectedWarehouseId.value = undefined
      locationList.value = []
      formData.value = {
        id: undefined,
        code: undefined,
        name: undefined,
        locationId: undefined,
        area: undefined,
        maxLoad: undefined,
        positionX: undefined,
        positionY: undefined,
        positionZ: undefined,
        status: CommonStatusEnum.ENABLE,
        frozen: false,
        allowItemMixing: true,
        allowBatchMixing: true,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { BarcodeDetail, DICT_TYPE, barcodeDetailRef, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, handleBarcode, handleWarehouseChange, isDetail, loadLocationList, locationList, message, open, resetForm, selectedWarehouseId, submitForm, t, warehouseList }
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
